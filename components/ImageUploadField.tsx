"use client";

import { useState } from "react";

interface ImageUploadFieldProps {
  name: string;
  defaultValue?: string | null;
  label?: string;
}

export default function ImageUploadField({
  name,
  defaultValue = "",
  label = "Cover image URL or upload"
}: ImageUploadFieldProps) {
  const [imageUrl, setImageUrl] = useState<string>(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Upload failed");
      } else if (data?.url) {
        setImageUrl(data.url);
      }
    } catch {
      setError("Network error while uploading image");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium tracking-wide uppercase text-nearblack/80">
        {label}
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          name={name}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://... or upload an image file"
          className="flex-1 border border-nearblack/25 bg-cream/40 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
        />
        <label className="inline-flex items-center justify-center px-4 py-2.5 bg-nearblack text-cream font-cinzel text-xs tracking-widest uppercase cursor-pointer hover:bg-oxblood transition-colors">
          {uploading ? "Uploading…" : "Upload Image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      {error && <p className="text-sm text-oxblood font-medium">{error}</p>}
      {imageUrl && (
        <div className="mt-2 flex items-center gap-3 p-2 border border-gold/40 bg-cream/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Preview"
            className="h-14 w-20 object-cover border border-nearblack/15"
          />
          <span className="text-xs break-all text-nearblack/70 flex-1">{imageUrl}</span>
          <button
            type="button"
            onClick={() => setImageUrl("")}
            className="text-xs uppercase font-cinzel text-oxblood hover:underline px-2"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
