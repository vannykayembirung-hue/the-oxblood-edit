import assert from "node:assert/strict";
import { afterEach, before, test } from "node:test";
import { JSDOM } from "jsdom";
import { SUBSCRIBE_ERROR_COPY } from "../lib/newsletter";

// A browser-shaped global scope for react-dom, installed before React loads.
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost:3000/",
  pretendToBeVisual: true
});
Object.assign(globalThis, {
  window: dom.window,
  self: dom.window,
  document: dom.window.document,
  IS_REACT_ACT_ENVIRONMENT: true
});

let act: typeof import("react").act;
let createElement: typeof import("react").createElement;
let renderToString: typeof import("react-dom/server").renderToString;
let hydrateRoot: typeof import("react-dom/client").hydrateRoot;
let NewsletterCapture: typeof import("../components/NewsletterCapture").default;

before(async () => {
  ({ act, createElement } = await import("react"));
  ({ renderToString } = await import("react-dom/server"));
  ({ hydrateRoot } = await import("react-dom/client"));
  ({ default: NewsletterCapture } = await import("../components/NewsletterCapture"));
});

// Assertions compare text and booleans, never jsdom nodes: a failing
// `assert.equal(node, …)` makes node inspect the entire DOM graph.
type Captured = { url: string; body: Record<string, unknown>; seen: { email: string; consent: boolean } };
const requests: Captured[] = [];
const cleanups: (() => void)[] = [];

function fields(container: HTMLElement) {
  return {
    form: container.querySelector("form") as HTMLFormElement,
    email: container.querySelector('input[name="email"]') as HTMLInputElement,
    consent: container.querySelector('input[name="consent"]') as HTMLInputElement,
    alert: () => container.querySelector('[role="alert"]')
  };
}

/** Server-renders the capture form into the page, exactly as Next streams it. */
function serverRender(props: Parameters<typeof NewsletterCapture>[0]) {
  const element = createElement(NewsletterCapture, props);
  const container = document.createElement("div");
  container.innerHTML = renderToString(element);
  document.body.appendChild(container);
  return { container, element, ...fields(container) };
}

async function hydrate(container: HTMLElement, element: ReturnType<typeof createElement>) {
  await act(async () => {
    const root = hydrateRoot(container, element);
    cleanups.push(() => {
      act(() => root.unmount());
      container.remove();
    });
  });
}

async function submit(form: HTMLFormElement) {
  await act(async () => {
    form.requestSubmit();
  });
}

globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
  const { email, consent } = fields(document.body);
  requests.push({
    url: String(url),
    body: JSON.parse(String(init?.body)),
    // What the reader can see at the moment the request leaves.
    seen: { email: email.value, consent: consent.checked }
  });
  return new Response(JSON.stringify({ ok: true, status: "pending", dossier: null }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}) as typeof fetch;

afterEach(() => {
  requests.length = 0;
  cleanups.splice(0).forEach((cleanup) => cleanup());
});

test("a box ticked before hydration is honoured, not answered with 'Tick the consent box'", async () => {
  const { container, element, form, email, consent } = serverRender({ source: "homepage" });

  // Slow connection: the reader types and ticks while the bundle is still loading.
  email.value = "Reader@Example.com";
  consent.click();
  assert.equal(consent.checked, true);

  await hydrate(container, element);
  assert.equal(email.value, "Reader@Example.com");
  assert.equal(consent.checked, true);

  await submit(form);

  assert.equal(fields(container).alert()?.textContent ?? null, null, "no refusal for a ticked box");
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "/api/subscribe");
  assert.deepEqual(requests[0].body, {
    email: "reader@example.com",
    consent: true,
    archetype: null,
    source: "homepage",
    company: ""
  });
  assert.deepEqual(requests[0].seen, { email: "Reader@Example.com", consent: true });
  assert.match(container.textContent ?? "", /Noted in the ledger/);
});

test("a re-render never unticks the box the reader ticked (browser-restored state)", async () => {
  const { container, element, form, email, consent } = serverRender({ source: "footer" });

  // Back/reload: the browser restores the tick before React hydrates; the address is empty.
  consent.click();
  await hydrate(container, element);

  await submit(form);
  assert.equal(fields(container).alert()?.textContent, SUBSCRIBE_ERROR_COPY.invalid_email);
  assert.ok(document.activeElement === email, "focus moves to the address");
  assert.equal(email.getAttribute("aria-invalid"), "true");
  assert.equal(consent.checked, true, "the refusal re-render left the tick alone");
  assert.equal(requests.length, 0);

  email.value = "restored@example.com";
  await submit(form);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].body.consent, true);
  assert.equal(requests[0].body.email, "restored@example.com");
});

test("an unticked box is refused, focused and described — and cleared by ticking it", async () => {
  const { container, element, form, email, consent } = serverRender({ source: "journal" });
  await hydrate(container, element);

  email.value = "reader@example.com";
  await submit(form);

  const alert = fields(container).alert();
  assert.equal(alert?.textContent, "Tick the consent box and the desk will write to you.");
  assert.equal(requests.length, 0, "nothing is sent without consent");
  assert.ok(document.activeElement === consent, "focus moves to the consent box");
  assert.equal(consent.getAttribute("aria-invalid"), "true");
  assert.equal(consent.getAttribute("aria-describedby"), alert?.id);
  assert.equal(email.value, "reader@example.com", "the address survives the refusal");

  await act(async () => {
    consent.click();
  });
  assert.equal(fields(container).alert()?.textContent ?? null, null);
  assert.equal(consent.hasAttribute("aria-invalid"), false);

  await submit(form);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].body.consent, true);
});

test("before hydration the form is a safe POST with the browser's own checks", async () => {
  const markup = renderToString(
    createElement(NewsletterCapture, { source: "villainess-quiz", archetype: "velvet-widow" })
  );
  const page = new JSDOM(markup).window.document;
  const form = page.querySelector("form") as HTMLFormElement;

  // Never a GET: that put the reader's address in the URL, logs and history.
  assert.equal(form.getAttribute("method"), "post");
  assert.equal(form.getAttribute("action"), "/api/subscribe");
  assert.equal(form.hasAttribute("novalidate"), false);
  assert.ok(page.querySelector('input[type="hidden"][name="source"][value="villainess-quiz"]'));
  assert.ok(page.querySelector('input[type="hidden"][name="archetype"][value="velvet-widow"]'));
  assert.ok(page.querySelector('input[name="consent"][type="checkbox"][required]:not([checked])'));

  // The reader meets the consent box before the button, in reading and tab order.
  const order = [...form.querySelectorAll("input, button")]
    .filter((node) => node.getAttribute("type") !== "hidden" && node.getAttribute("tabindex") !== "-1")
    .map((node) => node.getAttribute("name") ?? node.getAttribute("type"));
  assert.deepEqual(order, ["email", "consent", "submit"]);

  // Once hydrated, refusals are reported in the house voice instead.
  const { container, element } = serverRender({ source: "shop" });
  await hydrate(container, element);
  assert.equal(fields(container).form.noValidate, true);
});
