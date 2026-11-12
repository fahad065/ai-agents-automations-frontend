"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Cookie } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  OPEN_SETTINGS_EVENT, clearAnalyticsCookies, readConsent, writeConsent, type ConsentState,
} from "@/lib/cookie-consent";

// Shows the consent banner on first visit and owns loading Google Analytics:
// GA is only rendered after the visitor accepts analytics cookies.
export function CookieConsent({ gaId }: { gaId: string }) {
  const { isAr } = useLang();
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [managing, setManaging] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState(false);

  useEffect(() => {
    const saved = readConsent();
    setConsent(saved);
    setOpen(!saved);
    setReady(true);

    const reopen = () => {
      const current = readConsent();
      setAnalyticsChoice(current?.analytics ?? false);
      setManaging(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  const decide = (analytics: boolean) => {
    const wasOn = consent?.analytics === true;
    setConsent(writeConsent(analytics));
    setOpen(false);
    setManaging(false);
    if (wasOn && !analytics) {
      // GA's script is already running in this page — clear its cookies and
      // reload so it's gone, rather than letting it keep tracking.
      clearAnalyticsCookies();
      window.location.reload();
    }
  };

  return (
    <>
      {consent?.analytics && <GoogleAnalytics gaId={gaId} />}

      {ready && open && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label={isAr ? "إعدادات ملفات تعريف الارتباط" : "Cookie preferences"}
          dir={isAr ? "rtl" : "ltr"}
          className="fixed inset-x-3 bottom-3 z-[1100] mx-auto max-w-[560px] rounded-2xl border bg-card p-5 text-card-foreground shadow-2xl sm:inset-x-auto sm:left-5 sm:bottom-5"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Cookie size={16} />
            </span>
            <p className="text-[15px] font-semibold text-foreground">
              {isAr ? "خصوصيتك تهمنا" : "We value your privacy"}
            </p>
          </div>

          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {isAr
              ? "نستخدم ملفات تعريف ارتباط أساسية لتسجيل دخولك وتشغيل الموقع. وبموافقتك، نستخدم ملفات Google Analytics لنفهم كيف يُستخدم الموقع ونحسّنه. تقدر تغيّر اختيارك في أي وقت من «إعدادات ملفات تعريف الارتباط» أسفل الصفحة. "
              : "We use essential cookies to keep you signed in and the site working. With your permission, we'd also use Google Analytics cookies to understand how the site is used so we can improve it. You can change this anytime from “Cookie settings” in the footer. "}
            <Link href="/cookies" className="font-medium text-primary underline-offset-2 hover:underline">
              {isAr ? "سياسة ملفات تعريف الارتباط" : "Cookie Policy"}
            </Link>
          </p>

          {managing && (
            <div className="mt-4 divide-y rounded-xl border">
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{isAr ? "ضرورية" : "Essential"}</p>
                  <p className="text-xs text-muted-foreground">
                    {isAr ? "تسجيل الدخول والتفضيلات. دائماً مفعّلة." : "Sign-in and preferences. Always on."}
                  </p>
                </div>
                <Switch checked disabled aria-label={isAr ? "ضرورية" : "Essential"} />
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{isAr ? "تحليلات" : "Analytics"}</p>
                  <p className="text-xs text-muted-foreground">
                    {isAr ? "Google Analytics — إحصاءات زيارات مجهولة." : "Google Analytics — anonymous visit statistics."}
                  </p>
                </div>
                <Switch
                  checked={analyticsChoice}
                  onCheckedChange={setAnalyticsChoice}
                  aria-label={isAr ? "تحليلات" : "Analytics"}
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            {managing ? (
              <Button onClick={() => decide(analyticsChoice)} className="sm:flex-1">
                {isAr ? "حفظ الاختيارات" : "Save choices"}
              </Button>
            ) : (
              <>
                {/* Reject is as prominent as Accept on purpose — consent
                    rules require refusing to be as easy as agreeing. */}
                <Button variant="outline" onClick={() => decide(false)} className="sm:flex-1">
                  {isAr ? "رفض غير الضرورية" : "Reject non-essential"}
                </Button>
                <Button onClick={() => decide(true)} className="sm:flex-1">
                  {isAr ? "قبول الكل" : "Accept all"}
                </Button>
              </>
            )}
          </div>
          {!managing && (
            <button
              type="button"
              onClick={() => { setAnalyticsChoice(consent?.analytics ?? false); setManaging(true); }}
              className="mt-2.5 w-full text-center text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {isAr ? "إدارة الإعدادات" : "Manage settings"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
