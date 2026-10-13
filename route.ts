import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return new Response("Blob storage is not configured", { status: 500 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return new Response("Missing file", { status: 400 });
  if (file.size > 10 * 1024 * 1024) return new Response("File too large (10 MB maximum)", { status: 413 });
  const blob = await put(file.name, file, { access: "public" });
  return Response.json(blob);
}
