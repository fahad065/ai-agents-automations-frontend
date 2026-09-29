"use client";

// Only catches errors thrown in the ROOT layout itself (src/app/layout.tsx)
// — errors inside a route segment are caught by error.tsx instead. Next.js
// requires this file to render its own <html>/<body> since it replaces the
// root layout entirely when it fires.
import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
