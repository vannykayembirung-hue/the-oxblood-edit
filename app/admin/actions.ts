"use server";

import { auth, signIn, signOut } from "@/lib/auth";
import {
  saveArticle,
  setArticleStatus,
  deleteArticleById,
  saveProduct,
  saveAffiliateLink,
  deleteAffiliateLinkById,
  setSubscriberStatus,
  deleteSubscriberById
} from "@/lib/db";
import { isSafeHttpUrl } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  return session;
}

function revalidateAllEditorialPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/journal");
  if (slug) {
    revalidatePath(`/journal/${slug}`);
  }
  revalidatePath("/shop/the-oxblood-code");
  revalidatePath("/admin");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect("/admin/login?error=missing");
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin"
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login?error=invalid");
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

export async function saveArticleAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") || "").trim() || undefined;
  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const category = String(formData.get("category") || "style").trim();
  const status = formData.get("status") === "published" ? "published" : "draft";
  const excerpt = String(formData.get("excerpt") || "").trim();
  const coverImage = String(formData.get("cover_image") || "").trim();
  const metaTitle = String(formData.get("meta_title") || "").trim();
  const metaDescription = String(formData.get("meta_description") || "").trim();
  const contentHtml = String(formData.get("content_html") || "");

  if (!title) {
    redirect("/admin?error=missing-title");
  }

  const saved = await saveArticle({
    id,
    title,
    slug,
    category,
    status,
    excerpt,
    cover_image: coverImage,
    meta_title: metaTitle,
    meta_description: metaDescription,
    content_html: contentHtml
  });

  revalidateAllEditorialPaths(saved.slug);
  redirect("/admin?notice=article-saved");
}

export async function toggleArticleStatusAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") || "").trim();
  const nextStatus = formData.get("next_status") === "published" ? "published" : "draft";
  const slug = String(formData.get("slug") || "").trim();

  if (id) {
    await setArticleStatus(id, nextStatus);
    revalidateAllEditorialPaths(slug);
  }
  redirect("/admin?notice=status-updated");
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") || "").trim();
  const slug = String(formData.get("slug") || "").trim();

  if (id) {
    await deleteArticleById(id);
    revalidateAllEditorialPaths(slug);
  }
  redirect("/admin?notice=article-deleted");
}

export async function saveProductAction(formData: FormData) {
  await requireAdminSession();

  const name = String(formData.get("name") || "The Oxblood Code").trim();
  const slug = String(formData.get("slug") || "the-oxblood-code").trim();
  const priceRaw = Number(formData.get("price") ?? 27);
  const gumroadUrl = String(formData.get("gumroad_url") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const whatInsideRaw = String(formData.get("what_inside") || "");

  if (gumroadUrl && gumroadUrl !== "__GUMROAD_URL__" && !isSafeHttpUrl(gumroadUrl)) {
    redirect("/admin?tab=product&error=invalid-gumroad-url");
  }

  const whatInside = whatInsideRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  await saveProduct({
    name,
    slug,
    price: priceRaw,
    gumroad_url: gumroadUrl || null,
    description: description || null,
    what_inside: whatInside
  });

  revalidateAllEditorialPaths();
  redirect("/admin?tab=product&notice=product-saved");
}

export async function saveAffiliateLinkAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") || "").trim() || undefined;
  const name = String(formData.get("name") || "").trim();
  const merchant = String(formData.get("merchant") || "").trim();
  const url = String(formData.get("url") || "").trim();
  const priceUs = String(formData.get("price_us") || "").trim();
  const priceUk = String(formData.get("price_uk") || "").trim();
  const image = String(formData.get("image") || "").trim();

  if (!name || !merchant || !isSafeHttpUrl(url)) {
    redirect("/admin?tab=affiliates&error=invalid-affiliate");
  }

  await saveAffiliateLink({
    id,
    name,
    merchant,
    url,
    price_us: priceUs || null,
    price_uk: priceUk || null,
    image: image || null
  });

  revalidateAllEditorialPaths();
  redirect("/admin?tab=affiliates&notice=affiliate-saved");
}

export async function deleteAffiliateLinkAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") || "").trim();
  if (id) {
    await deleteAffiliateLinkById(id);
    revalidateAllEditorialPaths();
  }
  redirect("/admin?tab=affiliates&notice=affiliate-deleted");
}

/**
 * Subscriber administration.
 *
 * Marking someone `confirmed` or `unsubscribed` is a consent state change, so it
 * writes the same timestamps the public endpoints do; `delete` is the Art. 17
 * erasure path and removes the row rather than flagging it.
 */
export async function updateSubscriberStatusAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") || "").trim();
  const requested = String(formData.get("status") || "").trim();
  const status =
    requested === "confirmed" || requested === "unsubscribed" ? requested : "pending";

  if (id) {
    await setSubscriberStatus(id, status);
    revalidatePath("/admin");
  }

  redirect(`/admin?tab=subscribers&notice=subscriber-${status}`);
}

export async function deleteSubscriberAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") || "").trim();
  if (id) {
    await deleteSubscriberById(id);
    revalidatePath("/admin");
  }

  redirect("/admin?tab=subscribers&notice=subscriber-erased");
}
