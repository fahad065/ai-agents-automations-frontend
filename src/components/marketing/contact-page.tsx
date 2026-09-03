"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/hooks/use-lang";
import { Mail, MapPin, Send, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import { FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ContactInfo {
  email: string;
  supportEmail: string;
  twitter: string;
  linkedin: string;
  address: string;
  address_ar?: string;
}

interface ContactPageData {
  title?: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_ar?: string;
  contactInfo?: ContactInfo;
}

export function ContactPage() {
  const { isAr } = useLang();
  const [pageData, setPageData] = useState<ContactPageData | null>(null);
  const contactInfo = pageData?.contactInfo ?? null;
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    fetch(`${apiUrl}/cms/pages/contact`)
      .then((r) => r.json())
      .then(setPageData)
      .catch(() => {});
  }, []);

  const heroTitle = (isAr && pageData?.title_ar) ? pageData.title_ar : (pageData?.title || (isAr ? "تواصل معنا" : "We'd love to hear from you."));
  const heroSubtitle = (isAr && pageData?.subtitle_ar) ? pageData.subtitle_ar : (pageData?.subtitle || (isAr ? "أسئلة، شراكات، أو مجرد دردشة عن الأتمتة بالذكاء الاصطناعي — نحن هنا ونرد بسرعة." : "Questions, partnerships, or just a chat about AI automation — we're here and we reply fast."));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError(isAr ? "يرجى ملء جميع الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }
    setSending(true); setError("");
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true); setSending(false);
  };

  const address = (isAr && contactInfo?.address_ar) ? contactInfo.address_ar : contactInfo?.address;

  const CONTACT_ITEMS = [
    contactInfo?.email && {
      icon: Mail, color: "#7c3aed",
      label: isAr ? "استفسارات عامة" : "General enquiries",
      value: contactInfo.email,
      href: `mailto:${contactInfo.email}`,
    },
    contactInfo?.supportEmail && {
      icon: Mail, color: "#22c55e",
      label: isAr ? "الدعم التقني" : "Technical support",
      value: contactInfo.supportEmail,
      href: `mailto:${contactInfo.supportEmail}`,
    },
    contactInfo?.twitter && {
      icon: FaTwitter, color: "#3b82f6",
      label: "X / Twitter",
      value: "@logicmate",
      href: contactInfo.twitter,
    },
    address && {
      icon: MapPin, color: "#f59e0b",
      label: isAr ? "الموقع" : "Location",
      value: address,
      href: null,
    },
  ].filter(Boolean) as any[];

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative mx-auto max-w-xl overflow-hidden px-6 pt-30 pb-16 text-center">
        <div className="pointer-events-none absolute top-1/2 left-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[80px]" />
        <span className="relative mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-4 py-1.5 text-[13px] font-medium text-primary">
          <MessageCircle className="size-3" /> {isAr ? "تواصل معنا" : "Get in touch"}
        </span>
        <h1 className="relative mb-4 text-[clamp(32px,5vw,52px)] leading-[1.1] font-extrabold tracking-tight text-foreground">
          {heroTitle}
        </h1>
        <p className="relative text-[17px] leading-relaxed text-muted-foreground">{heroSubtitle}</p>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
          {/* Contact info */}
          <div>
            <h2 className="mb-2 text-lg font-bold text-foreground">
              {isAr ? "تفاصيل التواصل" : "Contact details"}
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
              {isAr
                ? "نهدف نرد خلال 24 ساعة في أيام العمل. للدعم العاجل، راسلنا مباشرة على البريد."
                : "We aim to respond within 24 hours on business days. For urgent support, email us directly."}
            </p>

            <div className="mb-8 flex flex-col gap-3">
              {CONTACT_ITEMS.map((item: any, i: number) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 rounded-[11px] border bg-foreground/[0.015] px-4 py-3.5">
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-[9px] border"
                      style={{ background: `${item.color}12`, borderColor: `${item.color}25` }}
                    >
                      <Icon size={15} color={item.color} />
                    </div>
                    <div>
                      <p className="mb-0.5 text-[11px] text-muted-foreground">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={item.href.startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="text-[13px] font-medium no-underline"
                          style={{ color: item.color }}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-[13px] font-medium text-foreground">{item.value}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Social links */}
            <p className="mb-3 text-[13px] text-muted-foreground">
              {isAr ? "تابعنا على السوشيال" : "Find us on social"}
            </p>
            <div className="flex gap-2">
              {[
                { icon: FaTwitter, href: "https://twitter.com/logicmate", label: "Twitter" },
                { icon: FaInstagram, href: "https://instagram.com/logicmate", label: "Instagram" },
                { icon: FaLinkedin, href: "https://linkedin.com/company/logicmate", label: "LinkedIn" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className="flex size-9 items-center justify-center rounded-[9px] border bg-foreground/[0.02] text-muted-foreground no-underline"
                  >
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="mb-2 text-lg font-bold text-foreground">
              {isAr ? "أرسل رسالة" : "Send a message"}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {isAr ? "أخبرنا بما تحتاج وسنرد عليك بأسرع وقت." : "Tell us what you need and we’ll get right back to you."}
            </p>

            {sent ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
                <CheckCircle2 className="mx-auto mb-4 size-11 text-emerald-500" />
                <p className="mb-2 text-base font-bold text-foreground">
                  {isAr ? "تم إرسال رسالتك!" : "Message sent!"}
                </p>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {isAr ? "سنرد عليك خلال 24 ساعة." : "We’ll get back to you within 24 hours."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {error && (
                  <div className="rounded-[9px] border border-destructive/20 bg-destructive/[0.08] px-3.5 py-2.5 text-[13px] text-destructive">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    placeholder={isAr ? "اسمك *" : "Your name *"}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="h-auto rounded-[10px] py-3 text-sm"
                  />
                  <Input
                    type="email"
                    placeholder={isAr ? "بريدك الإلكتروني *" : "Your email *"}
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="h-auto rounded-[10px] py-3 text-sm"
                  />
                </div>
                <Input
                  placeholder={isAr ? "الموضوع" : "Subject"}
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className="h-auto rounded-[10px] py-3 text-sm"
                />
                <Textarea
                  placeholder={isAr ? "رسالتك *" : "Your message *"}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  rows={5}
                  className="resize-y rounded-[10px] text-sm"
                />
                <Button type="submit" disabled={sending} className="mt-1 w-full gap-2 py-5">
                  {sending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                  {sending ? (isAr ? "جاري الإرسال..." : "Sending...") : (isAr ? "أرسل الرسالة" : "Send message")}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
