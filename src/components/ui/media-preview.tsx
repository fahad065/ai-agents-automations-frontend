"use client";

import { FileText, Music } from "lucide-react";

// Preview of a media URL in admin forms: YouTube embed, video/audio player,
// image, or a link for documents (PDF, Office…).
const VIDEO = /\.(mp4|webm|mov|ogv|m4v|mkv|avi)(\?|#|$)/i;
const AUDIO = /\.(mp3|m4a|aac|wav|ogg|weba|flac)(\?|#|$)/i;
const IMAGE = /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i;

export function youtubeEmbedUrl(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export function isVideoFile(url: string): boolean {
  return VIDEO.test(url);
}

export function MediaPreview({ url }: { url?: string }) {
  const u = (url || "").trim();
  if (!/^https?:\/\//i.test(u)) return null;
  const yt = youtubeEmbedUrl(u);
  const box = "mt-2 w-full max-w-md overflow-hidden rounded-md border bg-black/5";
  if (yt) return <iframe src={yt} title="Video preview" className={`${box} aspect-video`} allowFullScreen />;
  if (VIDEO.test(u)) return <video key={u} src={u} controls preload="metadata" className={box} data-testid="media-preview-video" />;
  if (AUDIO.test(u)) {
    return (
      <div className="mt-2 flex max-w-md items-center gap-2">
        <Music size={14} className="shrink-0 text-muted-foreground" />
        <audio key={u} src={u} controls preload="metadata" className="w-full" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  if (IMAGE.test(u)) return <img src={u} alt="Preview" className={`${box} max-h-48 object-contain`} />;
  return (
    <a href={u} target="_blank" rel="noreferrer" className="mt-2 inline-flex max-w-md items-center gap-1.5 truncate text-xs font-medium text-primary hover:underline">
      <FileText size={13} className="shrink-0" /> {decodeURIComponent(u.split("/").pop()?.split("?")[0] || "Open file")}
    </a>
  );
}
