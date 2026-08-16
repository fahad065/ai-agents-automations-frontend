"use client";

import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import {
  MessageCircle, Globe, Smartphone, Zap,
  Clock, Shield, BarChart3, ArrowRight, Check, Bot,
  Users, Star, Headphones,
} from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

const CHANNELS = [
  {
    icon: Globe, color: "#7c3aed",
    label: "Website Widget",
    label_ar: "ودجت الموقع",
    desc: "Embed a branded chatbot on any page. Handles FAQs, lead capture, and booking — instantly.",
    desc_ar: "ركّب شات بوت على أي صفحة في موقعك. يرد على الأسئلة الشائعة، يجمع البيانات، ويحجز المواعيد فوراً.",
  },
  {
    icon: FaWhatsapp, color: "#22c55e",
    label: "WhatsApp",
    label_ar: "واتساب",
    desc: "Connect your WhatsApp Business number. Customers message you, the bot replies 24/7.",
    desc_ar: "وصّل رقم واتساب بيزنس. عملاؤك يراسلونك، البوت يرد على مدار الساعة.",
  },
  {
    icon: FaInstagram, color: "#e1306c",
    label: "Instagram DMs",
    label_ar: "رسائل إنستغرام",
    desc: "Auto-reply to DMs and story mentions. Convert followers into leads without lifting a finger.",
    desc_ar: "ردود تلقائية على الرسائل والمنشنز. حوّل متابعيك لعملاء بدون أي جهد يدوي.",
  },
  {
    icon: Smartphone, color: "#f59e0b",
    label: "Custom API",
    label_ar: "API مخصص",
    desc: "Integrate our chatbot engine into any platform via REST API. Full control, your UI.",
    desc_ar: "دمج محرك الشات بوت في أي منصة عبر REST API. تحكم كامل، واجهتك الخاصة.",
  },
];

const TEMPLATES = [
  {
    emoji: "🍽️",
    name: "Restaurant Menu Bot",
    name_ar: "بوت قائمة المطعم",
    desc: "Answers menu questions, takes reservations, shares daily specials.",
    desc_ar: "يرد على أسئلة القائمة، يحجز الطاولات، ويشارك العروض اليومية.",
    tags: ["Food & Beverage", "Bookings"],
    color: "#f59e0b",
  },
  {
    emoji: "🏠",
    name: "Real Estate Lead Bot",
    name_ar: "بوت العقارات",
    desc: "Qualifies buyers and renters, schedules viewings, sends listings.",
    desc_ar: "يؤهل المشترين والمستأجرين، يجدول المعاينات، ويرسل العروض.",
    tags: ["Real Estate", "Lead Capture"],
    color: "#7c3aed",
  },
  {
    emoji: "💆",
    name: "Clinic Appointment Bot",
    name_ar: "بوت حجز العيادة",
    desc: "Books appointments, sends reminders, handles clinic FAQs.",
    desc_ar: "يحجز المواعيد، يرسل التذكيرات، ويرد على أسئلة العيادة.",
    tags: ["Healthcare", "Appointments"],
    color: "#22c55e",
  },
  {
    emoji: "🛍️",
    name: "E-commerce Support Bot",
    name_ar: "بوت دعم التجارة الإلكترونية",
    desc: "Tracks orders, handles returns, answers product questions instantly.",
    desc_ar: "يتابع الطلبات، يعالج الإرجاع، ويرد على أسئلة المنتجات فوراً.",
    tags: ["E-commerce", "Support"],
    color: "#3b82f6",
  },
  {
    emoji: "🏋️",
    name: "Gym Membership Bot",
    name_ar: "بوت اشتراك الصالة",
    desc: "Explains membership plans, books free trials, handles schedule queries.",
    desc_ar: "يشرح خطط الاشتراك، يحجز التجارب المجانية، ويرد على استفسارات الجداول.",
    tags: ["Fitness", "Memberships"],
    color: "#ef4444",
  },
  {
    emoji: "🎓",
    name: "Education Enrolment Bot",
    name_ar: "بوت التسجيل التعليمي",
    desc: "Guides prospective students, answers course FAQs, collects applications.",
    desc_ar: "يوجّه الطلاب المحتملين، يرد على أسئلة الدورات، ويجمع الطلبات.",
    tags: ["Education", "Enrolment"],
    color: "#8b5cf6",
  },
];

const FEATURES = [
  {
    icon: Clock, color: "#7c3aed",
    title: "24/7 Availability",
    title_ar: "متاح 24/7",
    desc: "Never miss a customer message. Your bot handles conversations while you sleep.",
    desc_ar: "ما تفوّت أي رسالة. البوت يتكفل بالمحادثات وأنت نايم.",
  },
  {
    icon: Users, color: "#22c55e",
    title: "Arabic + English",
    title_ar: "عربي + إنجليزي",
    desc: "Seamless bilingual conversations. Detects language automatically and responds in kind.",
    desc_ar: "محادثات ثنائية اللغة بسلاسة. يكتشف اللغة تلقائياً ويرد بنفسها.",
  },
  {
    icon: Shield, color: "#3b82f6",
    title: "No Hallucinations",
    title_ar: "بدون إجابات خاطئة",
    desc: "Your bot only answers from your knowledge base. No made-up facts, ever.",
    desc_ar: "البوت يرد فقط من قاعدة معرفتك. ما في معلومات مختلقة.",
  },
  {
    icon: BarChart3, color: "#f59e0b",
    title: "Conversation Analytics",
    title_ar: "تحليلات المحادثات",
    desc: "See what customers ask most, drop-off points, and conversion rates.",
    desc_ar: "شوف أكثر الأسئلة المتكررة، نقاط التخلي، ومعدلات التحويل.",
  },
  {
    icon: Zap, color: "#ef4444",
    title: "Deploy in Minutes",
    title_ar: "انشر في دقائق",
    desc: "Paste a snippet or scan a QR code. No developer needed.",
    desc_ar: "الصق كود أو امسح QR. ما تحتاج مطور.",
  },
  {
    icon: Headphones, color: "#8b5cf6",
    title: "Human Handoff",
    title_ar: "تحويل للبشر",
    desc: "Bot escalates complex queries to a human agent automatically.",
    desc_ar: "البوت يحوّل الاستفسارات المعقدة تلقائياً لوكيل بشري.",
  },
];

const STEPS = [
  { n: "01", title: "Choose a template", title_ar: "اختر قالباً", desc: "Pick from 6+ industry templates or start from scratch.", desc_ar: "اختر من 6+ قوالب متخصصة أو ابدأ من الصفر." },
  { n: "02", title: "Upload your knowledge", title_ar: "أضف قاعدة معرفتك", desc: "Paste your FAQ, upload a PDF, or connect your website URL.", desc_ar: "الصق الأسئلة الشائعة، ارفع PDF، أو وصّل رابط موقعك." },
  { n: "03", title: "Connect your channel", title_ar: "وصّل القناة", desc: "Website widget, WhatsApp, or Instagram — one click each.", desc_ar: "ودجت الموقع، واتساب، أو إنستغرام — نقرة واحدة لكل منها." },
  { n: "04", title: "Go live", title_ar: "أطلق البوت", desc: "Your bot is live and handling customers. Check the dashboard for insights.", desc_ar: "البوت شغّال ويتعامل مع العملاء. راقب لوحة التحكم للمتابعة." },
];

export function ChatbotsPage() {
  const { colors, isDark } = useTheme();
  const { isAr } = useLang();
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: colors.bg }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{
        padding: "120px 24px 80px", maxWidth: "820px",
        margin: "0 auto", textAlign: "center", position: "relative",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "600px", height: "600px",
          background: "rgba(124,58,237,0.06)",
          borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none",
        }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          border: "1px solid rgba(124,58,237,0.3)",
          background: "rgba(124,58,237,0.08)",
          color: "#a78bfa", padding: "6px 16px",
          borderRadius: "9999px", fontSize: "13px",
          fontWeight: 500, marginBottom: "28px",
        }}>
          <Bot size={13} /> {isAr ? "جديد — الشات بوت بالذكاء الاصطناعي" : "New — AI Chatbots"}
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 800,
          letterSpacing: "-0.04em", color: colors.text,
          marginBottom: "24px", lineHeight: 1.05,
        }}>
          {isAr ? (
            <>
              شات بوت ذكي يرد على{" "}
              <span style={{
                backgroundImage: "linear-gradient(135deg, #c4b5fd, #a78bfa, #7c3aed)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                عملاؤك بدلاً عنك
              </span>
            </>
          ) : (
            <>
              AI chatbots that talk{" "}
              <span style={{
                backgroundImage: "linear-gradient(135deg, #c4b5fd, #a78bfa, #7c3aed)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                to your customers for you
              </span>
            </>
          )}
        </h1>

        <p style={{
          fontSize: "18px", lineHeight: 1.75,
          color: colors.textMuted, maxWidth: "600px",
          margin: "0 auto 40px",
        }}>
          {isAr
            ? "نشر شات بوت على موقعك، واتساب، أو إنستغرام في دقائق. يرد بالعربي والإنجليزي. متاح 24/7. ما في كود."
            : "Deploy a chatbot on your website, WhatsApp, or Instagram in minutes. Responds in Arabic and English. On 24/7. No code required."}
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/auth/signup" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white", padding: "14px 32px", borderRadius: "10px",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
          }}>
            {isAr ? "ابدأ مجاناً" : "Start free"} <ArrowRight size={16} />
          </Link>
          <Link href="/contact" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            border: `1px solid ${border}`, color: colors.textMuted,
            padding: "14px 28px", borderRadius: "10px",
            fontSize: "15px", fontWeight: 500, textDecoration: "none",
          }}>
            {isAr ? "شوف ديمو" : "See a demo"}
          </Link>
        </div>

        {/* Social proof */}
        <div style={{
          marginTop: "48px", display: "flex",
          alignItems: "center", justifyContent: "center",
          gap: "24px", flexWrap: "wrap",
        }}>
          {[
            { v: "< 5 min", label: isAr ? "وقت الإعداد" : "setup time" },
            { v: "24/7", label: isAr ? "ردود تلقائية" : "automated replies" },
            { v: "2 langs", label: isAr ? "عربي وإنجليزي" : "AR + EN" },
          ].map(({ v, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "22px", fontWeight: 800, color: colors.text, letterSpacing: "-0.02em" }}>{v}</p>
              <p style={{ fontSize: "12px", color: colors.textMuted }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Channels ─────────────────────────────────────────── */}
      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px 96px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
            {isAr ? "القنوات" : "Channels"}
          </p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, color: colors.text, letterSpacing: "-0.03em" }}>
            {isAr ? "كل قناة. نقرة واحدة." : "Every channel. One click."}
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            return (
              <div key={ch.label} style={{
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                border: `1px solid ${border}`,
                borderRadius: "16px", padding: "28px 24px",
                transition: "border-color 0.2s, transform 0.2s",
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = ch.color + "50";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = border;
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: ch.color + "15", border: `1px solid ${ch.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "16px",
                }}>
                  <Icon size={20} color={ch.color} />
                </div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: colors.text, marginBottom: "8px" }}>
                  {isAr ? ch.label_ar : ch.label}
                </p>
                <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.65 }}>
                  {isAr ? ch.desc_ar : ch.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Templates ────────────────────────────────────────── */}
      <section style={{
        borderTop: `1px solid ${border}`,
        padding: "96px 24px",
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
              {isAr ? "القوالب" : "Templates"}
            </p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, color: colors.text, letterSpacing: "-0.03em", marginBottom: "12px" }}>
              {isAr ? "جاهز لقطاعك" : "Ready for your industry"}
            </h2>
            <p style={{ fontSize: "15px", color: colors.textMuted, maxWidth: "500px", margin: "0 auto" }}>
              {isAr
                ? "قوالب مُعدّة مسبقاً لأعمال الخليج. عدّل، انشر، وخلّ البوت يشتغل."
                : "Pre-built templates for GCC businesses. Customise, deploy, and let the bot handle the rest."}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "16px" }}>
            {TEMPLATES.map((t) => (
              <div key={t.name} style={{
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                border: `1px solid ${border}`, borderRadius: "16px",
                padding: "24px", transition: "border-color 0.2s",
                cursor: "default",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = t.color + "40"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = border; }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "12px" }}>
                  <span style={{
                    fontSize: "28px", width: "44px", height: "44px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: t.color + "12", borderRadius: "12px", flexShrink: 0,
                  }}>{t.emoji}</span>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>
                      {isAr ? t.name_ar : t.name}
                    </p>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {t.tags.map(tag => (
                        <span key={tag} style={{
                          fontSize: "10px", fontWeight: 600, padding: "2px 7px",
                          borderRadius: "4px", background: t.color + "12", color: t.color,
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.65 }}>
                  {isAr ? t.desc_ar : t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section style={{
        borderTop: `1px solid ${border}`,
        padding: "96px 24px",
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, color: colors.text, letterSpacing: "-0.03em", marginBottom: "12px" }}>
              {isAr ? "كل شي تحتاجه. لا شي تحتاج تبرمجه." : "Everything you need. Nothing to code."}
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} style={{
                  display: "flex", gap: "16px", alignItems: "flex-start",
                  padding: "20px", borderRadius: "14px",
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                  border: `1px solid ${border}`,
                }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
                    background: f.color + "12", border: `1px solid ${f.color}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={17} color={f.color} />
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: colors.text, marginBottom: "5px" }}>
                      {isAr ? f.title_ar : f.title}
                    </p>
                    <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.65 }}>
                      {isAr ? f.desc_ar : f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section style={{
        borderTop: `1px solid ${border}`,
        padding: "96px 24px",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
              {isAr ? "كيف يعمل" : "How it works"}
            </p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, color: colors.text, letterSpacing: "-0.03em" }}>
              {isAr ? "من الصفر للنشر في 4 خطوات" : "From zero to live in 4 steps"}
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2px" }}>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{
                padding: "32px 24px", textAlign: "center",
                background: i === STEPS.length - 1
                  ? "rgba(124,58,237,0.05)" : "transparent",
                border: `1px solid ${i === STEPS.length - 1 ? "rgba(124,58,237,0.25)" : border}`,
                borderRadius: "14px",
              }}>
                <div style={{
                  fontSize: "28px", fontWeight: 900, color: "#a78bfa",
                  opacity: 0.25, marginBottom: "12px", letterSpacing: "-0.04em",
                }}>{s.n}</div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: colors.text, marginBottom: "8px" }}>
                  {isAr ? s.title_ar : s.title}
                </p>
                <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.65 }}>
                  {isAr ? s.desc_ar : s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 120px" }}>
        <div style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(109,40,217,0.06))"
            : "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(109,40,217,0.02))",
          border: "1px solid rgba(124,58,237,0.25)",
          borderRadius: "20px", padding: "56px 48px",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-80px", right: "-80px",
            width: "280px", height: "280px",
            background: "rgba(124,58,237,0.1)", borderRadius: "50%",
            filter: "blur(60px)", pointerEvents: "none",
          }} />

          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)",
            color: "#a78bfa", padding: "5px 14px", borderRadius: "9999px",
            fontSize: "12px", fontWeight: 600, marginBottom: "20px",
          }}>
            <Star size={11} /> {isAr ? "مجاناً 30 يوم، ما في بطاقة ائتمان" : "Free 30 days, no credit card"}
          </div>

          <h2 style={{
            fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800,
            color: colors.text, marginBottom: "16px", letterSpacing: "-0.03em",
          }}>
            {isAr ? "جاهز تنشر أول بوت؟" : "Ready to deploy your first bot?"}
          </h2>
          <p style={{ fontSize: "16px", color: colors.textMuted, marginBottom: "36px", maxWidth: "480px", margin: "0 auto 36px" }}>
            {isAr
              ? "عملاؤك ينتظرون. بوتك يمكن يكون شغّال خلال أقل من 5 دقائق."
              : "Your customers are waiting. Your bot can be live in under 5 minutes."}
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/signup" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "white", padding: "14px 32px", borderRadius: "10px",
              fontSize: "15px", fontWeight: 600, textDecoration: "none",
              boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
            }}>
              {isAr ? "ابدأ مجاناً" : "Get started free"} <ArrowRight size={16} />
            </Link>
            <Link href="/contact" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              border: `1px solid ${border}`, color: colors.textMuted,
              padding: "14px 28px", borderRadius: "10px",
              fontSize: "15px", fontWeight: 500, textDecoration: "none",
            }}>
              {isAr ? "تحدث مع الفريق" : "Talk to the team"}
            </Link>
          </div>

          {/* Checklist */}
          <div style={{
            marginTop: "32px", display: "flex",
            alignItems: "center", justifyContent: "center",
            gap: "20px", flexWrap: "wrap",
          }}>
            {[
              isAr ? "ما في كود" : "No code",
              isAr ? "نشر في دقائق" : "Deploy in minutes",
              isAr ? "إلغاء في أي وقت" : "Cancel anytime",
            ].map((item) => (
              <span key={item} style={{
                display: "flex", alignItems: "center", gap: "5px",
                fontSize: "12px", color: colors.textMuted,
              }}>
                <Check size={12} color="#22c55e" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
