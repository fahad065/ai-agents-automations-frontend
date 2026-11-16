import { FileDown } from "lucide-react";

// "Download brochure" — shown next to "Watch demo" on every service detail
// page that has `content.brochureUrl` set (admin: Services → Basic tab).
// Vercel Blob serves files inline by default; `?download=1` makes it send
// Content-Disposition: attachment so the PDF downloads instead of opening.
// (The `download` attribute alone is ignored for cross-origin URLs.)
export function brochureDownloadHref(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith(".blob.vercel-storage.com")) u.searchParams.set("download", "1");
    return u.toString();
  } catch {
    return url;
  }
}

export function BrochureButton({ url, isAr }: { url?: string; isAr: boolean }) {
  if (!url) return null;
  return (
    <a
      href={brochureDownloadHref(url)}
      download
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-[10px] border bg-foreground/[0.02] px-6 py-3.5 text-[15px] font-medium text-muted-foreground no-underline"
    >
      <FileDown size={14} /> {isAr ? "حمّل الكتيّب" : "Download brochure"}
    </a>
  );
}
