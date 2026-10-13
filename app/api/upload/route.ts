import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/sanitize";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TO_EXT: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "image/avif": [".avif"]
};

function hasValidImageSignature(bytes: Uint8Array, mime: string): boolean {
  if (bytes.length < 12) return false;

  switch (mime) {
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      return (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      );
    case "image/gif":
      return (
        bytes[0] === 0x47 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x38 &&
        (bytes[4] === 0x37 || bytes[4] === 0x39) &&
        bytes[5] === 0x61
      );
    case "image/webp":
      return (
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
      );
    case "image/avif":
      // ISO Base Media File Format: bytes 4..7 == "ftyp"
      return (
        bytes[4] === 0x66 &&
        bytes[5] === 0x74 &&
        bytes[6] === 0x79 &&
        bytes[7] === 0x70
      );
    default:
      return false;
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Invalid multipart form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size === 0) {
    return Response.json({ error: "Empty file is not allowed" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "File too large (10 MB maximum)" }, { status: 413 });
  }

  const allowedExts = ALLOWED_MIME_TO_EXT[file.type];
  if (!allowedExts) {
    return Response.json(
      { error: "Unsupported file type. Allowed: JPEG, PNG, WEBP, GIF, AVIF." },
      { status: 415 }
    );
  }

  const originalExt = path.extname(file.name).toLowerCase();
  if (!allowedExts.includes(originalExt)) {
    return Response.json(
      { error: "File extension does not match declared MIME type." },
      { status: 415 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasValidImageSignature(new Uint8Array(buffer), file.type)) {
    return Response.json(
      { error: "File content failed binary image signature validation." },
      { status: 415 }
    );
  }

  const baseName = slugify(path.basename(file.name, originalExt)) || "image";
  const safeFileName = `articles/${baseName}${originalExt}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(safeFileName, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type
    });
    return Response.json(blob);
  }

  if (process.env.NODE_ENV !== "production") {
    const suffix = crypto.randomBytes(4).toString("hex");
    const localFileName = `${baseName}-${suffix}${originalExt}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, localFileName), buffer);
    return Response.json({
      url: `/uploads/${localFileName}`,
      pathname: `uploads/${localFileName}`,
      contentType: file.type
    });
  }

  return Response.json({ error: "Blob storage is not configured" }, { status: 500 });
}
