"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import {
  MessageCircle, Globe, Smartphone, Zap,
  Clock, Shield, BarChart3, ArrowRight, Check, Bot,
  Users, Star, Headphones, Play, X,
} from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GENERAL_DEMO_URL = "https://1ajwuueru6fqolyr.public.blob.vercel-storage.com/chatbot-demos/logicmate-chatbots-product-demo.mp4";

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

interface ChatbotTemplateCard {
  _id: string;
  slug: string;
  name: string;
  name_ar?: string;
  description: string;
  description_ar?: string;
  icon: string;
  color: string;
  capabilities: string[];
  demoVideoUrl?: string;
}

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
  const { isDark } = useTheme();
  const { isAr } = useLang();
  const [demoVideo, setDemoVideo] = useState<{ url: string; title: string } | null>(null);
  const [templates, setTemplates] = useState<ChatbotTemplateCard[]>([]);
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    fetch(`${apiUrl}/modules?moduleType=chatbot`)
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => setTemplates(json.data || json || []))
      .catch(() => setTemplates([]));
  }, []);

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-[820px] overflow-hidden px-6 pt-30 pb-20 text-center">
        <div className="pointer-events-none absolute top-1/2 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[100px]" />

        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.08] px-4 py-1.5 text-[13px] font-medium text-primary">
          <Bot size={13} /> {isAr ? "جديد — الشات بوت بالذكاء الاصطناعي" : "New — AI Chatbots"}
        </div>

        <h1 className="mb-6 text-[clamp(36px,6vw,68px)] leading-[1.05] font-extrabold tracking-[-0.04em] text-foreground">
          {isAr ? (
            <>
              شات بوت ذكي يرد على{" "}
              <span className="bg-gradient-to-br from-[#c4b5fd] via-[#a78bfa] to-[#7c3aed] bg-clip-text text-transparent">
                عملاؤك بدلاً عنك
              </span>
            </>
          ) : (
            <>
              AI chatbots that talk{" "}
              <span className="bg-gradient-to-br from-[#c4b5fd] via-[#a78bfa] to-[#7c3aed] bg-clip-text text-transparent">
                to your customers for you
              </span>
            </>
          )}
        </h1>

        <p className="mx-auto mb-10 max-w-[600px] text-lg leading-[1.75] text-muted-foreground">
          {isAr
            ? "نشر شات بوت على موقعك، واتساب، أو إنستغرام في دقائق. يرد بالعربي والإنجليزي. متاح 24/7. ما في كود."
            : "Deploy a chatbot on your website, WhatsApp, or Instagram in minutes. Responds in Arabic and English. On 24/7. No code required."}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/auth/signup" />}
            className="gap-2 rounded-[10px] px-8 py-6 text-[15px] shadow-[0_4px_24px_rgba(124,58,237,0.4)]"
          >
            {isAr ? "ابدأ الآن" : "Get started"} <ArrowRight size={16} />
          </Button>
          <Button
            variant="outline"
            onClick={() => setDemoVideo({ url: GENERAL_DEMO_URL, title: "LogicMate Chatbots" })}
            className="rounded-[10px] px-7 py-6 text-[15px] font-medium"
          >
            {isAr ? "شوف ديمو" : "See a demo"}
          </Button>
        </div>

        {/* Social proof */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          {[
            { v: "< 5 min", label: isAr ? "وقت الإعداد" : "setup time" },
            { v: "24/7", label: isAr ? "ردود تلقائية" : "automated replies" },
            { v: "2 langs", label: isAr ? "عربي وإنجليزي" : "AR + EN" },
          ].map(({ v, label }) => (
            <div key={label} className="text-center">
              <p className="text-[22px] font-extrabold tracking-[-0.02em] text-foreground">{v}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Channels ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1000px] px-6 pb-24">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[11px] font-bold tracking-[0.1em] text-primary uppercase">
            {isAr ? "القنوات" : "Channels"}
          </p>
          <h2 className="text-[clamp(24px,4vw,38px)] font-extrabold tracking-[-0.03em] text-foreground">
            {isAr ? "كل قناة. نقرة واحدة." : "Every channel. One click."}
          </h2>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const isHovered = hoveredChannel === ch.label;
            return (
              <div
                key={ch.label}
                className="rounded-2xl border px-6 py-7 transition-all"
                style={{
                  borderColor: isHovered ? ch.color + "50" : undefined,
                  transform: isHovered ? "translateY(-2px)" : undefined,
                }}
                onMouseEnter={() => setHoveredChannel(ch.label)}
                onMouseLeave={() => setHoveredChannel(null)}
              >
                <div
                  className="mb-4 flex size-11 items-center justify-center rounded-xl border"
                  style={{ background: ch.color + "15", borderColor: `${ch.color}30` }}
                >
                  <Icon size={20} color={ch.color} />
                </div>
                <p className="mb-2 text-[15px] font-bold text-foreground">
                  {isAr ? ch.label_ar : ch.label}
                </p>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {isAr ? ch.desc_ar : ch.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Templates ────────────────────────────────────────── */}
      <section className="border-t px-6 py-24">
        <div className="mx-auto max-w-[1000px]">
          <div className="mb-12 text-center">
            <p className="mb-3 text-[11px] font-bold tracking-[0.1em] text-primary uppercase">
              {isAr ? "القوالب" : "Templates"}
            </p>
            <h2 className="mb-3 text-[clamp(24px,4vw,38px)] font-extrabold tracking-[-0.03em] text-foreground">
              {isAr ? "جاهز لقطاعك" : "Ready for your industry"}
            </h2>
            <p className="mx-auto max-w-[500px] text-[15px] text-muted-foreground">
              {isAr
                ? "قوالب مُعدّة مسبقاً لأعمال الخليج. عدّل، انشر، وخلّ البوت يشتغل."
                : "Pre-built templates for GCC businesses. Customise, deploy, and let the bot handle the rest."}
            </p>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}>
            {templates.map((t) => {
              const isHovered = hoveredTemplate === t._id;
              return (
                <Link
                  key={t._id}
                  href={`/chatbots/${t.slug}`}
                  className="block rounded-2xl border p-6 no-underline transition-colors"
                  style={{ borderColor: isHovered ? t.color + "40" : undefined }}
                  onMouseEnter={() => setHoveredTemplate(t._id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                >
                  <div className="mb-3 flex items-start gap-3.5">
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl text-[28px]"
                      style={{ background: t.color + "12" }}
                    >{t.icon}</span>
                    <div>
                      <p className="mb-1 text-sm font-bold text-foreground">
                        {(isAr && t.name_ar) ? t.name_ar : t.name}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {t.capabilities?.slice(0, 2).map(tag => (
                          <span key={tag} className="rounded px-1.75 py-0.5 text-[10px] font-semibold" style={{ background: t.color + "12", color: t.color }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className={cn("text-[13px] leading-relaxed text-muted-foreground", t.demoVideoUrl ? "mb-4" : "mb-0")}>
                    {(isAr && t.description_ar) ? t.description_ar : t.description}
                  </p>
                  {t.demoVideoUrl && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDemoVideo({ url: t.demoVideoUrl!, title: (isAr && t.name_ar) ? t.name_ar : t.name });
                      }}
                      className="flex w-full items-center gap-1.75 rounded-[9px] border px-3 py-2.25 text-[12.5px] font-semibold transition-colors"
                      style={{ background: t.color + "10", borderColor: `${t.color}30`, color: t.color }}
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full" style={{ background: t.color }}>
                        <Play size={9} fill="white" color="white" />
                      </span>
                      {isAr ? "شاهد كيف يعمل" : "Watch it in action"}
                    </button>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="border-t px-6 py-24">
        <div className="mx-auto max-w-[1000px]">
          <div className="mb-14 text-center">
            <h2 className="text-[clamp(24px,4vw,38px)] font-extrabold tracking-[-0.03em] text-foreground">
              {isAr ? "كل شي تحتاجه. لا شي تحتاج تبرمجه." : "Everything you need. Nothing to code."}
            </h2>
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start gap-4 rounded-2xl border p-5">
                  <div
                    className="flex size-9.5 shrink-0 items-center justify-center rounded-[10px] border"
                    style={{ background: f.color + "12", borderColor: `${f.color}25` }}
                  >
                    <Icon size={17} color={f.color} />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-bold text-foreground">{isAr ? f.title_ar : f.title}</p>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">{isAr ? f.desc_ar : f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="border-t px-6 py-24">
        <div className="mx-auto max-w-[900px]">
          <div className="mb-14 text-center">
            <p className="mb-3 text-[11px] font-bold tracking-[0.1em] text-primary uppercase">
              {isAr ? "كيف يعمل" : "How it works"}
            </p>
            <h2 className="text-[clamp(24px,4vw,38px)] font-extrabold tracking-[-0.03em] text-foreground">
              {isAr ? "من الصفر للنشر في 4 خطوات" : "From zero to live in 4 steps"}
            </h2>
          </div>

          <div className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="rounded-[14px] border p-8 text-center"
                style={i === STEPS.length - 1 ? { background: "rgba(124,58,237,0.05)", borderColor: "rgba(124,58,237,0.25)" } : undefined}
              >
                <div className="mb-3 text-[28px] font-black tracking-[-0.04em] text-primary opacity-25">{s.n}</div>
                <p className="mb-2 text-sm font-bold text-foreground">{isAr ? s.title_ar : s.title}</p>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{isAr ? s.desc_ar : s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[900px] px-6 pb-30">
        <div
          className={cn(
            "relative overflow-hidden rounded-[20px] border border-primary/25 p-14 text-center",
            isDark ? "bg-gradient-to-br from-primary/12 to-[#6d28d9]/6" : "bg-gradient-to-br from-primary/6 to-[#6d28d9]/2"
          )}
        >
          <div className="pointer-events-none absolute -top-20 -right-20 size-[280px] rounded-full bg-primary/10 blur-[60px]" />

          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.25 text-xs font-semibold text-primary">
            <Star size={11} /> {isAr ? "أسعار مخصصة لعملك" : "Custom pricing, built for your business"}
          </div>

          <h2 className="mb-4 text-[clamp(24px,4vw,38px)] font-extrabold tracking-[-0.03em] text-foreground">
            {isAr ? "جاهز تنشر أول بوت؟" : "Ready to deploy your first bot?"}
          </h2>
          <p className="mx-auto mb-9 max-w-[480px] text-base text-muted-foreground">
            {isAr
              ? "عملاؤك ينتظرون. بوتك يمكن يكون شغّال خلال أقل من 5 دقائق."
              : "Your customers are waiting. Your bot can be live in under 5 minutes."}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              nativeButton={false}
              render={<Link href="/auth/signup" />}
              className="gap-2 rounded-[10px] px-8 py-6 text-[15px] shadow-[0_4px_24px_rgba(124,58,237,0.4)]"
            >
              {isAr ? "ابدأ الآن" : "Get started"} <ArrowRight size={16} />
            </Button>
            <Button nativeButton={false} variant="outline" render={<Link href="/contact" />} className="rounded-[10px] px-7 py-6 text-[15px] font-medium">
              {isAr ? "تحدث مع الفريق" : "Talk to the team"}
            </Button>
          </div>

          {/* Checklist */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
            {[
              isAr ? "ما في كود" : "No code",
              isAr ? "نشر في دقائق" : "Deploy in minutes",
              isAr ? "إلغاء في أي وقت" : "Cancel anytime",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.25 text-xs text-muted-foreground">
                <Check size={12} className="text-[#22c55e]" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo video modal ─────────────────────────────────── */}
      {demoVideo && (
        <div
          onClick={() => setDemoVideo(null)}
          className="fixed inset-0 z-1000 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[800px] overflow-hidden rounded-2xl bg-black shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between px-4.5 py-3.5">
              <p className="text-[13px] font-semibold text-white">
                {demoVideo.title} — {isAr ? "ديمو مباشر" : "Live demo"}
              </p>
              <button
                onClick={() => setDemoVideo(null)}
                aria-label={isAr ? "إغلاق" : "Close"}
                className="flex size-7 items-center justify-center rounded-full bg-white/10 text-white"
              >
                <X size={14} />
              </button>
            </div>
            <video
              src={demoVideo.url}
              controls
              autoPlay
              playsInline
              className="block aspect-video w-full bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}
