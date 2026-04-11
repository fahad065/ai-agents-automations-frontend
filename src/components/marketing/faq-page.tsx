"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { CmsPage } from "./cms-page";
import { ChevronDown, ChevronUp, Loader2, Search } from "lucide-react";
import Link from "next/link";

interface FaqItem {
  question: string;
  answer: string;
  order: number;
}

function FaqItemRow({ question, answer }: FaqItem) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      border: `1px solid ${colors.border}`,
      borderRadius: "10px", overflow: "hidden",
      marginBottom: "8px",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "16px 20px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          background: colors.bgCard, border: "none",
          cursor: "pointer", textAlign: "left", gap: "16px",
        }}
      >
        <span style={{ fontSize: "15px", fontWeight: 500, color: colors.text }}>
          {question}
        </span>
        {open
          ? <ChevronUp size={16} color={colors.textMuted} style={{ flexShrink: 0 }} />
          : <ChevronDown size={16} color={colors.textMuted} style={{ flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div style={{
          padding: "0 20px 18px",
          background: colors.bgCard,
          borderTop: `1px solid ${colors.border}`,
        }}>
          <p style={{
            fontSize: "14px", color: colors.textMuted,
            lineHeight: 1.7, paddingTop: "14px",
          }}>
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

export function FaqPage() {
  const { colors } = useTheme();
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    fetch(`${apiUrl}/cms/pages/faq`)
      .then((r) => r.json())
      .then((data) => setFaqItems(
        (data.faqItems || []).sort((a: FaqItem, b: FaqItem) => a.order - b.order)
      ))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = faqItems.filter(
    (item) =>
      !search ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CmsPage
      title="Frequently asked questions"
      subtitle="Everything you need to know about NexAgent"
    >
      {/* Search */}
      <div style={{ position: "relative", marginBottom: "32px" }}>
        <Search size={16} color={colors.textMuted} style={{
          position: "absolute", left: "14px", top: "50%",
          transform: "translateY(-50%)",
        }} />
        <input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "12px 14px 12px 42px",
            borderRadius: "10px", fontSize: "14px",
            border: `1px solid ${colors.border}`,
            background: colors.bgCard, color: colors.text,
            outline: "none", boxSizing: "border-box" as const,
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px" }}>
          <Loader2 size={28} color="#7c3aed"
            style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {filtered.map((item) => (
            <FaqItemRow key={item.question} {...item} />
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: colors.textMuted, marginBottom: "12px" }}>
                No questions match your search.
              </p>
              <button
                onClick={() => setSearch("")}
                style={{
                  padding: "8px 16px", borderRadius: "8px",
                  background: "#7c3aed", color: "white",
                  border: "none", cursor: "pointer", fontSize: "13px",
                }}
              >
                Clear search
              </button>
            </div>
          )}

          {/* Still have questions */}
          <div style={{
            marginTop: "48px",
            background: "rgba(124,58,237,0.06)",
            border: "1px solid rgba(124,58,237,0.2)",
            borderRadius: "14px", padding: "28px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: "16px", fontWeight: 600, color: colors.text, marginBottom: "8px" }}>
              Still have questions?
            </p>
            <p style={{ fontSize: "14px", color: colors.textMuted, marginBottom: "16px" }}>
              Our team is happy to help.
            </p>
            <Link href="/contact" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "10px 24px", borderRadius: "8px",
              background: "#7c3aed", color: "white",
              textDecoration: "none", fontSize: "14px", fontWeight: 600,
            }}>
              Contact support
            </Link>
          </div>
        </>
      )}
    </CmsPage>
  );
}