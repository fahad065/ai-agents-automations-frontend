"use client";

import { useRef, useState } from "react";
import { FileText, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

// Photos (up to 5) and one PDF brochure on a knowledge entry. Files go
// straight from the browser to storage (Cloudflare R2) through a signed
// upload URL from POST /uploads (purpose "chatbot-knowledge"); the entry is
// saved with the uploaded keys.

export interface KnowledgeAttachment {
  kind: "image" | "pdf";
  key: string;
  url: string;
  name: string;
  size?: number;
  /** Uploaded in this form session and not saved on an entry yet. */
  unsaved?: boolean;
}

export interface MediaUsage {
  enabled: boolean;
  used: { image: number; pdf: number };
  limits: { image: number; pdf: number };
  perEntry: { image: number; pdf: number };
  maxBytes: { image: number; pdf: number };
}

// Photo formats every browser can show (sent as they are). Any other photo
// the browser can open (e.g. iPhone HEIC in Safari, TIFF) is converted to JPG
// before upload, so visitors on any browser can see it.
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/bmp"];
const CONVERT_EXT = /\.(heic|heif|tiff?|jfif|pjpeg)$/i;

async function toJpeg(file: File): Promise<File | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) return null;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return null; // this browser can't open the format
  }
}

// The file to upload: as-is when it's a web photo format, otherwise a JPG copy.
async function webPhoto(file: File): Promise<File | null> {
  if (IMAGE_TYPES.includes(file.type) && !CONVERT_EXT.test(file.name)) return file;
  if (!file.type.startsWith("image/") && !CONVERT_EXT.test(file.name)) return null;
  if (file.type === "image/svg+xml") return null;
  return toJpeg(file);
}

export function KnowledgeMediaPicker({
  botId,
  value,
  onChange,
  usage,
}: {
  botId: string;
  value: KnowledgeAttachment[];
  onChange: (next: KnowledgeAttachment[]) => void;
  usage: MediaUsage | null;
}) {
  const [busy, setBusy] = useState(0);
  const photoInput = useRef<HTMLInputElement>(null);
  const pdfInput = useRef<HTMLInputElement>(null);
  const latest = useRef(value);
  latest.current = value;

  if (!usage) return null;
  if (!usage.enabled) {
    return (
      <p className="rounded-md border border-dashed px-3 py-2 text-[11px] text-muted-foreground">
        Photo and PDF uploads aren&apos;t set up on this server yet.
      </p>
    );
  }

  const photos = value.filter((a) => a.kind === "image");
  const pdfs = value.filter((a) => a.kind === "pdf");
  const mb = (b: number) => `${Math.round(b / (1024 * 1024))} MB`;

  async function upload(kind: "image" | "pdf", files: FileList | null) {
    if (!files?.length) return;
    const room = usage!.perEntry[kind] - (kind === "image" ? photos.length : pdfs.length);
    const list = Array.from(files).slice(0, Math.max(room, 0));
    if (!list.length) {
      toast.error(kind === "image" ? `Up to ${usage!.perEntry.image} photos per entry` : "One PDF per entry");
      return;
    }
    for (const original of list) {
      let file = original;
      if (kind === "image") {
        const photo = await webPhoto(original);
        if (!photo) { toast.error(`${original.name}: this photo format can't be opened here — save it as JPG or PNG and try again`); continue; }
        file = photo;
      }
      if (kind === "pdf" && file.type !== "application/pdf") { toast.error(`${file.name}: not a PDF`); continue; }
      if (file.size > usage!.maxBytes[kind]) { toast.error(`${file.name} is larger than ${mb(usage!.maxBytes[kind])}`); continue; }
      setBusy((n) => n + 1);
      try {
        // The platform's one upload endpoint; the purpose decides folder,
        // allowed types, size limits and plan limits.
        const { data } = await api.post(`/uploads`, {
          purpose: "chatbot-knowledge", chatbotId: botId, contentType: file.type, size: file.size, name: file.name,
        });
        const res = await fetch(data.uploadUrl, { method: "PUT", headers: data.headers, body: file });
        if (!res.ok) throw new Error(`Upload failed (${res.status})`);
        const added: KnowledgeAttachment = { kind, key: data.key, url: data.url, name: data.name, size: file.size, unsaved: true };
        onChange([...latest.current, added]);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        toast.error(e?.response?.data?.message || e?.message || `Couldn't upload ${file.name}`);
      } finally {
        setBusy((n) => n - 1);
      }
    }
  }

  function remove(a: KnowledgeAttachment) {
    onChange(latest.current.filter((x) => x.key !== a.key));
    // Never saved on an entry: delete it from storage now. Saved files are
    // deleted by the backend when the entry is saved without them.
    if (a.unsaved) api.delete(`/uploads`, { params: { purpose: "chatbot-knowledge", chatbotId: botId, key: a.key } }).catch(() => {});
  }

  return (
    <div data-testid="knowledge-media">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-foreground">Photos &amp; brochure (optional)</span>
        <span className="text-[11px] text-muted-foreground">
          {usage.used.image}/{usage.limits.image} photos · {usage.used.pdf}/{usage.limits.pdf} PDFs on your plan
        </span>
      </div>
      <p className="mb-2 mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
        Shown in the website chat when the bot answers this question — e.g. a property&apos;s photos and its brochure.
        Up to {usage.perEntry.image} photos (any format — JPG, PNG, WebP, AVIF, GIF, iPhone HEIC… — {mb(usage.maxBytes.image)} each) and 1 PDF ({mb(usage.maxBytes.pdf)}).
      </p>

      <div className="flex flex-wrap gap-2">
        {photos.map((a) => (
          <div key={a.key} className="group relative size-20 overflow-hidden rounded-md border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.url} alt={a.name} className="size-full object-cover" />
            <button type="button" onClick={() => remove(a)} aria-label={`Remove ${a.name}`}
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white">
              <X size={11} />
            </button>
          </div>
        ))}
        {pdfs.map((a) => (
          <div key={a.key} className="flex h-20 max-w-[220px] items-center gap-2 rounded-md border bg-card px-3">
            <FileText size={18} className="shrink-0 text-destructive" />
            <a href={a.url} target="_blank" rel="noreferrer" className="truncate text-xs font-medium text-foreground hover:underline">{a.name}</a>
            <button type="button" onClick={() => remove(a)} aria-label={`Remove ${a.name}`} className="shrink-0 text-muted-foreground hover:text-destructive">
              <X size={13} />
            </button>
          </div>
        ))}
        {busy > 0 && (
          <div className="flex size-20 items-center justify-center rounded-md border border-dashed">
            <Loader2 size={18} className="animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" disabled={photos.length >= usage.perEntry.image || busy > 0} onClick={() => photoInput.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50">
          <ImagePlus size={13} /> Add photos
        </button>
        <button type="button" disabled={pdfs.length >= usage.perEntry.pdf || busy > 0} onClick={() => pdfInput.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50">
          <FileText size={13} /> Add PDF brochure
        </button>
        <input ref={photoInput} type="file" accept="image/*,.heic,.heif" multiple hidden data-testid="photo-input"
          onChange={(e) => { upload("image", e.target.files); e.target.value = ""; }} />
        <input ref={pdfInput} type="file" accept="application/pdf" hidden data-testid="pdf-input"
          onChange={(e) => { upload("pdf", e.target.files); e.target.value = ""; }} />
      </div>
    </div>
  );
}
