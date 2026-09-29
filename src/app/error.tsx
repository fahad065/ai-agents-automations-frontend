"use client";

// Route-segment error boundary — catches anything thrown while rendering a
// page/layout below the root, reports it to Sentry, and shows a recoverable
// fallback instead of Next's default error screen (which reports nothing).
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        This error has been reported automatically. Try again, or contact support if it keeps happening.
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
