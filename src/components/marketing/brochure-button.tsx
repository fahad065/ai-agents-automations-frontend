import { FileDown } from "lucide-react";

// "Download brochure" — shown next to "Watch demo" on every service detail
// page that has `content.brochureUrl` set (admin: Services → Basic tab,
// uploaded to Cloudflare R2). Opens in a new tab; the browser's own viewer
// has a download button.
export function BrochureButton({ url, isAr }: { url?: string; isAr: boolean }) {
  if (!url) return null;
  return (
    <a
      href={url}
      download
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-[10px] border bg-foreground/[0.02] px-4.5 py-3.5 text-[15px] font-medium whitespace-nowrap text-muted-foreground no-underline"
    >
      <FileDown size={14} /> {isAr ? "حمّل الكتيّب" : "Download brochure"}
    </a>
  );
}
