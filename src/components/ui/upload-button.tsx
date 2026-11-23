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

// Some browsers leave file.type empty for less common formats (MKV, M4A…);
// fall back to the extension so the backend can check the type.
const TYPE_BY_EXT: Record<string, string> = {
  mp4: "video/mp4", m4v: "video/x-m4v", mov: "video/quicktime", webm: "video/webm", ogv: "video/ogg",
  mkv: "video/x-matroska", avi: "video/x-msvideo", mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac",
  wav: "audio/wav", ogg: "audio/ogg", flac: "audio/flac", weba: "audio/webm", jpg: "image/jpeg", jpeg: "image/jpeg",
  png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif", bmp: "image/bmp", pdf: "application/pdf",
  doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv", txt: "text/plain", zip: "application/zip",
};
export function fileContentType(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  return TYPE_BY_EXT[(file.name.split(".").pop() || "").toLowerCase()] || file.type || "application/octet-stream";
}

// PUT with progress (large videos can take minutes).
function putWithProgress(url: string, headers: Record<string, string>, file: File, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    for (const [k, v] of Object.entries(headers || {})) xhr.setRequestHeader(k, v);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed — check your connection"));
    xhr.send(file);
  });
}

export function UploadButton({
  purpose,
  details,
  accept,
  label = "Upload",
  onUploaded,
  disabled,
  testId,
}: {
  purpose: string;
  details?: Record<string, string | undefined>;
  accept: string;
  label?: string;
  onUploaded: (file: UploadedFile) => void | Promise<void>;
  disabled?: boolean;
  testId?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setPct(0);
    try {
      const { data } = await api.post("/uploads", { purpose, ...details, contentType: fileContentType(file), size: file.size, name: file.name });
      await putWithProgress(data.uploadUrl, data.headers, file, setPct);
      await onUploaded({ key: data.key, url: data.url, name: data.name, contentType: data.contentType, size: data.size });
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
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {busy ? `Uploading… ${pct}%` : label}
      </button>
      <input ref={input} type="file" accept={accept} hidden data-testid={testId} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
    </>
  );
}
