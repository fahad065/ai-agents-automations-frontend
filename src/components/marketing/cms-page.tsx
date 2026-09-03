interface CmsPageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function CmsPage({ title, subtitle, children, maxWidth = "760px" }: CmsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b px-6 pt-24 pb-12 text-center">
        <div className="mx-auto max-w-xl">
          <h1 className="mb-3 text-[clamp(28px,5vw,48px)] font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && <p className="text-base leading-relaxed text-muted-foreground">{subtitle}</p>}
        </div>
      </section>

      <div className="mx-auto px-6 pt-14 pb-24" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}

// Renders HTML content from CMS with typography scoped to this element only
// (the previous version used a global unscoped <style> tag for h2/h3/p/etc,
// which leaked those rules onto every page rendered alongside it — scoping
// via Tailwind's descendant selectors fixes that as a side effect of the
// reskin, not a separate change).
export function CmsContent({ html }: { html: string }) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className="text-muted-foreground [&_a]:text-primary [&_a]:no-underline [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:mb-1.5 [&_li]:text-[15px] [&_li]:leading-[1.8] [&_ol]:mb-4 [&_ol]:pl-5 [&_p]:mb-4 [&_p]:text-[15px] [&_p]:leading-[1.8] [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mb-4 [&_ul]:pl-5"
    />
  );
}
