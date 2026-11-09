import type { useRouter } from "next/navigation";

// actionUrl is sometimes a real external link (e.g. a YouTube video URL
// from a pipeline-complete notification) and sometimes an internal
// dashboard path — router.push() only understands the latter; handing it
// an external URL silently fails (Next treats it as a relative path, not
// a real navigation). Shared by notifications-page.tsx and the header's
// notification dropdown so both behave the same way.
export function navigateToAction(url: string, router: ReturnType<typeof useRouter>) {
  if (/^https?:\/\//.test(url)) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    router.push(url);
  }
}
