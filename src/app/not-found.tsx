import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { NotFoundContent } from "@/components/not-found-content";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

// Rendered (with an HTTP 404) for any URL that matches no route, and for
// any page that calls notFound() — e.g. a service/blog/CMS slug the API
// says doesn't exist.
export default function NotFound() {
  return (
    <>
      <Navbar />
      <NotFoundContent />
      <Footer />
    </>
  );
}
