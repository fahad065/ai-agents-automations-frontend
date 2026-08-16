"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { ChevronDown, ChevronUp, Search, Loader2, MessageCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  order: number;
}

function FaqRow({ question, answer }: FaqItem) {
  const { colors, isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <div style={{
      border: `1px solid ${open ? "rgba(124,58,237,0.25)" : border}`,
      borderRadius: "12px", overflow: "hidden", marginBottom: "8px",
      background: open ? "rgba(124,58,237,0.04)" : (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)"),
      transition: "all 0.2s",
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "18px 22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "transparent", border: "none",
        cursor: "pointer", textAlign: "left", gap: "16px",
      }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: colors.text, lineHeight: 1.4 }}>
          {question}
        </span>
        <div style={{
          width: "24px", height: "24px", borderRadius: "6px", flexShrink: 0,
          background: open ? "rgba(124,58,237,0.15)" : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}>
          {open
            ? <ChevronUp size={14} color="#a78bfa" />
            : <ChevronDown size={14} color={colors.textMuted} />
          }
        </div>
      </button>
      {open && (
        <div style={{ padding: "0 22px 18px", borderTop: `1px solid ${border}` }}>
          <p style={{
            fontSize: "14px", color: colors.textMuted,
            lineHeight: 1.75, paddingTop: "16px",
          }}>
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

export function FaqPage() {
  const { colors, isDark } = useTheme();
  const { isAr } = useLang();
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    fetch(`${apiUrl}/cms/pages/faq`)
      .then((r) => r.json())
      .then((data) => setPageData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rawItems: FaqItem[] = (isAr && pageData?.faqItems_ar?.length)
    ? pageData.faqItems_ar
    : (pageData?.faqItems || []);
  const faqItems = [...rawItems].sort((a, b) => a.order - b.order);

  const filtered = faqItems.filter((item) =>
    !search ||
    item.question.toLowerCase().includes(search.toLowerCase()) ||
    item.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: colors.bg }}>

      {/* Hero */}
      <section style={{
        padding: "120px 24px 64px", textAlign: "center",
        maxWidth: "680px", margin: "0 auto",
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
          FAQ
        </span>
        <h1 style={{
          fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800,
          letterSpacing: "-0.04em", color: colors.text,
          marginBottom: "16px", lineHeight: 1.1,
        }}>
          {isAr ? "أسئلة وإجابات" : "Questions answered."}
        </h1>
        <p style={{ fontSize: "17px", color: colors.textMuted, lineHeight: 1.7 }}>
          {isAr
            ? "كل شي تحتاج تعرفه عن لوجيك ميت — كيف يشتغل، كم يكلف، وما تتوقعه."
            : "Everything you need to know about LogicMate — how it works, what it costs, and what to expect."}
        </p>
      </section>

      {/* Content */}
      <section style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px 100px" }}>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "36px" }}>
          <Search size={15} color={colors.textMuted} style={{
            position: "absolute", left: isAr ? "auto" : "16px", right: isAr ? "16px" : "auto",
            top: "50%", transform: "translateY(-50%)", pointerEvents: "none",
          }} />
          <input
            placeholder={isAr ? "ابحث في الأسئلة..." : "Search questions..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: isAr ? "13px 44px 13px 16px" : "13px 16px 13px 44px",
              borderRadius: "11px", fontSize: "14px",
              border: `1px solid ${border}`,
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              color: colors.text, outline: "none",
              boxSizing: "border-box" as const,
              fontFamily: "inherit",
              direction: isAr ? "rtl" : "ltr",
            }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Loader2 size={28} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {filtered.map((item) => (
              <FaqRow key={item.question} {...item} />
            ))}

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px" }}>
                <p style={{ color: colors.textMuted, marginBottom: "16px" }}>
                  {isAr ? `لا توجد أسئلة تطابق "${search}"` : `No questions match "${search}"`}
                </p>
                <button onClick={() => setSearch("")} style={{
                  padding: "9px 20px", borderRadius: "8px",
                  background: "#7c3aed", color: "white",
                  border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                }}>
                  {isAr ? "مسح البحث" : "Clear search"}
                </button>
              </div>
            )}

            {/* Still have questions */}
            <div style={{
              marginTop: "48px",
              background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
              border: `1px solid ${border}`,
              borderRadius: "16px", padding: "32px",
              textAlign: "center",
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "11px",
                background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <MessageCircle size={20} color="#a78bfa" />
              </div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: colors.text, marginBottom: "8px" }}>
                {isAr ? "عندك أسئلة ثانية؟" : "Still have questions?"}
              </p>
              <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "20px", lineHeight: 1.6 }}>
                {isAr
                  ? "فريقنا يرد خلال 24 ساعة في أيام العمل."
                  : "Our team replies within 24 hours on business days."}
              </p>
              <Link href="/contact" style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "10px 24px", borderRadius: "9px",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "white", textDecoration: "none",
                fontSize: "13px", fontWeight: 600,
                boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
              }}>
                {isAr ? "تواصل مع الدعم" : "Contact support"}
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
