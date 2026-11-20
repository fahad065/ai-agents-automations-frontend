"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

// Reusable upload button for the platform's one upload endpoint
// (POST /uploads → signed URL → PUT straight to Cloudflare R2).
// `purpose` + `details` say what is being uploaded (the backend decides the
// folder, allowed types and size limits). onUploaded gets the stored key and,
// for public files, the URL to save on the record.
export interface UploadedFile {
  key: string;
  url: string | null;
  name: string;
  contentType: string;
  size: number;
}

export function UploadButton({
  purpose,
  details,
  accept,
  label = "Upload",
  onUploaded,
  disabled,
}: {
  purpose: string;
  details?: Record<string, string | undefined>;
  accept: string;
  label?: string;
  onUploaded: (file: UploadedFile) => void;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const { data } = await api.post("/uploads", { purpose, ...details, contentType: file.type, size: file.size, name: file.name });
      const res = await fetch(data.uploadUrl, { method: "PUT", headers: data.headers, body: file });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      onUploaded({ key: data.key, url: data.url, name: data.name, contentType: data.contentType, size: data.size });
      toast.success(`${file.name} uploaded`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(e?.response?.data?.message || e?.message || `Couldn't upload ${file.name}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => input.current?.click()}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {busy ? "Uploading…" : label}
      </button>
      <input ref={input} type="file" accept={accept} hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
    </>
  );
}
