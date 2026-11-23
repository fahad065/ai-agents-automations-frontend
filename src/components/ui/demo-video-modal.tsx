"use client";

import { useState } from "react";
import { ExternalLink, Play, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { youtubeEmbedUrl } from "@/components/ui/media-preview";

// The one pop-up player for every "Watch demo" / "See a demo" button.
// YouTube links play in an embed; uploaded files (Cloudflare R2: MP4, WebM,
// MOV…) in a <video> player. If the file can't be played (missing, wrong
// format for this browser, network) it shows a message and a direct link
// instead of a broken player. Escape, the backdrop and X all close it.
export function DemoVideoModal({
  url,
  title,
  isAr = false,
  onClose,
}: {
  url: string | null;
  title?: string;
  isAr?: boolean;
  onClose: () => void;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const open = !!url;
  const yt = url ? youtubeEmbedUrl(url) : null;
  const failed = !!url && failedUrl === url;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden border-0 bg-black p-0 text-white sm:max-w-3xl" data-testid="demo-video-modal">
        <div className="flex items-center justify-between gap-3 px-4.5 py-3.5">
          <DialogTitle className="truncate text-[13px] font-semibold text-white">
            {title ? `${title} — ` : ""}{isAr ? "ديمو" : "Demo"}
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            aria-label={isAr ? "إغلاق" : "Close"}
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={14} />
          </button>
        </div>
        {open && (yt ? (
          <iframe
            key={yt}
            src={`${yt}?autoplay=1`}
            title={title || "Demo video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="block aspect-video w-full border-0"
          />
        ) : failed ? (
          <div className="flex aspect-video flex-col items-center justify-center gap-2 px-6 text-center text-[13px] text-[#a3a3a3]">
            <Play size={24} className="text-[#525252]" />
            {isAr ? "تعذّر تشغيل الفيديو هنا." : "This video couldn't be played here."}
            <a href={url!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#a78bfa]">
              {isAr ? "افتح الفيديو مباشرة" : "Open the video directly"} <ExternalLink size={11} />
            </a>
          </div>
        ) : (
          <video
            key={url!}
            src={url!}
            controls
            autoPlay
            playsInline
            preload="metadata"
            onError={() => setFailedUrl(url)}
            className="block aspect-video w-full bg-black"
            data-testid="demo-video-player"
          />
        ))}
      </DialogContent>
    </Dialog>
  );
}
