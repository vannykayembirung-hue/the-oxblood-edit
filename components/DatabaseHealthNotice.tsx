import type { ReactNode } from "react";
import type { DatabaseHealth } from "@/lib/db";

/**
 * What the dashboard says about the database.
 *
 * Public pages fall back to the built-in seed copy when Neon fails, so the site
 * looks fine while every newsletter sign-up is refused. This names the problem
 * and the fix, and stays silent when there is nothing to fix.
 */

const ENV_SETTINGS = "Vercel → your project → Settings → Environment Variables";
const REFUSAL = "“The desk could not record that just now.”";

export function databaseBadge(health: DatabaseHealth): { label: string; healthy: boolean } {
  if (health.mode === "local") return { label: "Local Store Mode", healthy: health.persistent };
  if (!health.connected) return { label: "Neon unreachable", healthy: false };
  if (health.missingTables.length > 0) return { label: "Neon schema incomplete", healthy: false };
  return { label: "Neon PostgreSQL", healthy: true };
}

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      role="alert"
      aria-label="Database status"
      className="mt-6 border-l-4 border-oxblood bg-oxblood/10 px-4 py-3 text-nearblack"
    >
      <p className="font-semibold text-oxblood">{title}</p>
      <div className="text-sm mt-1 space-y-1">{children}</div>
    </section>
  );
}

const List = ({ names }: { names: string[] }) => (
  <>
    {names.map((name, index) => (
      <span key={name}>
        {index > 0 && ", "}
        <code>{name}</code>
      </span>
    ))}
  </>
);

export default function DatabaseHealthNotice({ health }: { health: DatabaseHealth }) {
  if (health.mode === "local") {
    if (health.persistent) return null;
    return (
      <Notice title="This deployment has no database.">
        <p>
          <code>DATABASE_URL</code> is not set here, and Vercel keeps no files between requests, so changes
          made on this page are lost and newsletter sign-ups are refused with {REFUSAL}
        </p>
        <p>
          Add <code>DATABASE_URL</code> in {ENV_SETTINGS}, for Production and for Preview, then redeploy.
        </p>
      </Notice>
    );
  }

  if (!health.connected) {
    return (
      <Notice title="Neon is not answering.">
        <p>
          Neon replied: <code className="break-all">{health.error}</code>
        </p>
        <p>
          Until it answers, the public pages show the built-in seed copy and every newsletter sign-up is refused
          with {REFUSAL} Check <code>DATABASE_URL</code> in {ENV_SETTINGS} (Production and Preview) and that the
          Neon project is active, then redeploy.
        </p>
      </Notice>
    );
  }

  if (health.missingTables.length > 0) {
    return (
      <Notice title="Neon is connected, but tables are missing.">
        <p>
          Missing: <List names={health.missingTables} />. Run <code>neon.sql</code> in the Neon SQL Editor (it is
          safe to re-run), then reload this page.
        </p>
        {health.missingTables.includes("subscribers") && (
          <p>
            The subscribers table could not be created automatically, so newsletter sign-ups are refused. The
            Vercel function logs give the reason after “Could not prepare the Neon subscribers table”.
          </p>
        )}
      </Notice>
    );
  }

  return null;
}
