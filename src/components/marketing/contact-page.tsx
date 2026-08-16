"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { Mail, MapPin, Send, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import { FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

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
  const { colors, isDark } = useTheme();
  const { isAr } = useLang();
  const [pageData, setPageData] = useState<ContactPageData | null>(null);
  const contactInfo = pageData?.contactInfo ?? null;
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

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

  const inp = {
    width: "100%", padding: "12px 16px",
    borderRadius: "10px", fontSize: "14px",
    border: `1px solid ${border}`,
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    color: colors.text, outline: "none",
    boxSizing: "border-box" as const, fontFamily: "inherit",
    marginBottom: "12px",
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
    <div dir={isAr ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: colors.bg }}>

      {/* Hero */}
      <section style={{
        padding: "120px 24px 64px", textAlign: "center",
        maxWidth: "640px", margin: "0 auto",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "400px", height: "400px",
          background: "rgba(124,58,237,0.06)",
          borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none",
        }} />
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          border: "1px solid rgba(124,58,237,0.3)",
          background: "rgba(124,58,237,0.08)",
          color: "#a78bfa", padding: "6px 16px", borderRadius: "9999px",
          fontSize: "13px", fontWeight: 500, marginBottom: "24px",
        }}>
          <MessageCircle size={12} /> {isAr ? "تواصل معنا" : "Get in touch"}
        </span>
        <h1 style={{
          fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800,
          letterSpacing: "-0.04em", color: colors.text,
          marginBottom: "16px", lineHeight: 1.1,
        }}>
          {heroTitle}
        </h1>
        <p style={{ fontSize: "17px", color: colors.textMuted, lineHeight: 1.7 }}>
          {heroSubtitle}
        </p>
      </section>

      {/* Content */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "48px",
        }}>

          {/* Contact info */}
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: colors.text, marginBottom: "8px" }}>
              {isAr ? "تفاصيل التواصل" : "Contact details"}
            </h2>
            <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "32px" }}>
              {isAr
                ? "نهدف نرد خلال 24 ساعة في أيام العمل. للدعم العاجل، راسلنا مباشرة على البريد."
                : "We aim to respond within 24 hours on business days. For urgent support, email us directly."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              {CONTACT_ITEMS.map((item: any, i: number) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "14px 16px", borderRadius: "11px",
                    background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                    border: `1px solid ${border}`,
                  }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "9px",
                      background: `${item.color}12`, border: `1px solid ${item.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Icon size={15} color={item.color} />
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: colors.textMuted, marginBottom: "2px" }}>{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          style={{ fontSize: "13px", color: item.color, textDecoration: "none", fontWeight: 500 }}>
                          {item.value}
                        </a>
                      ) : (
                        <p style={{ fontSize: "13px", color: colors.text, fontWeight: 500 }}>{item.value}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Social links */}
            <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "12px" }}>
              {isAr ? "تابعنا على السوشيال" : "Find us on social"}
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { icon: FaTwitter, href: "https://twitter.com/logicmate", label: "Twitter" },
                { icon: FaInstagram, href: "https://instagram.com/logicmate", label: "Instagram" },
                { icon: FaLinkedin, href: "https://linkedin.com/company/logicmate", label: "LinkedIn" },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label} style={{
                    width: "36px", height: "36px", borderRadius: "9px",
                    border: `1px solid ${border}`,
                    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: colors.textMuted, textDecoration: "none",
                  }}>
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: colors.text, marginBottom: "8px" }}>
              {isAr ? "أرسل رسالة" : "Send a message"}
            </h2>
            <p style={{ fontSize: "14px", color: colors.textMuted, marginBottom: "24px" }}>
              {isAr
                ? "أخبرنا بما تحتاج وسنرد عليك بأسرع وقت."
                : "Tell us what you need and we’ll get right back to you."}
            </p>

            {sent ? (
              <div style={{
                background: "rgba(34,197,94,0.05)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "14px", padding: "40px", textAlign: "center",
              }}>
                <CheckCircle2 size={44} color="#22c55e" style={{ margin: "0 auto 16px" }} />
                <p style={{ fontSize: "16px", fontWeight: 700, color: colors.text, marginBottom: "8px" }}>
                  {isAr ? "تم إرسال رسالتك!" : "Message sent!"}
                </p>
                <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.65 }}>
                  {isAr ? "سنرد عليك خلال 24 ساعة." : "We’ll get back to you within 24 hours."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "9px", padding: "10px 14px",
                    fontSize: "13px", color: "#ef4444", marginBottom: "12px",
                  }}>
                    {error}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                  <input placeholder={isAr ? "اسمك *" : "Your name *"} value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} style={inp} />
                  <input type="email" placeholder={isAr ? "بريدك الإلكتروني *" : "Your email *"} value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} style={inp} />
                </div>
                <input placeholder={isAr ? "الموضوع" : "Subject"} value={form.subject}
                  onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} style={inp} />
                <textarea placeholder={isAr ? "رسالتك *" : "Your message *"} value={form.message}
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={5} style={{ ...inp, resize: "vertical" as const }} />
                <button type="submit" disabled={sending} style={{
                  width: "100%", padding: "13px",
                  borderRadius: "10px", fontSize: "14px",
                  fontWeight: 600, cursor: sending ? "not-allowed" : "pointer",
                  background: sending ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "white", border: "none",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "8px",
                  boxShadow: sending ? "none" : "0 4px 16px rgba(124,58,237,0.3)",
                }}>
                  {sending
                    ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                    : <Send size={15} />
                  }
                  {sending
                    ? (isAr ? "جاري الإرسال..." : "Sending...")
                    : (isAr ? "أرسل الرسالة" : "Send message")}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
