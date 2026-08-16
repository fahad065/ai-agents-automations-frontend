"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";

const NICHE_SUGGESTIONS: Record<string, string[]> = {
  youtube: [
    "Dark psychology and human behavior",
    "Forbidden history and hidden secrets",
    "Mind control and manipulation tactics",
    "True crime and criminal psychology",
    "Stoicism and ancient philosophy",
    "Financial freedom and wealth psychology",
    "Body language and deception detection",
    "Conspiracy theories and cover-ups",
    "Self-improvement and discipline",
    "Social engineering and persuasion",
    "Quantum physics explained simply",
    "Ancient civilizations and mysteries",
  ],
  instagram: [
    "Motivational quotes and mindset",
    "Fitness transformation tips",
    "Luxury lifestyle and success",
    "Relationship psychology",
    "Financial advice for millennials",
  ],
  default: [
    "Dark psychology and human behavior",
    "Personal finance and wealth building",
    "Fitness and body transformation",
    "Relationships and human connection",
    "Technology and AI trends",
  ],
};

interface Props {
  value: string;
  onChange: (niche: string) => void;
  pipelineType?: string;
  colors: any;
  isDark: boolean;
}

export function NicheSuggester({ value, onChange, pipelineType = "youtube", colors, isDark }: Props) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  const getSuggestions = () => {
    setLoading(true);
    const list = NICHE_SUGGESTIONS[pipelineType] || NICHE_SUGGESTIONS.default;
    const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, 6);
    setTimeout(() => {
      setSuggestions(shuffled);
      setShowSuggestions(true);
      setLoading(false);
    }, 400);
  };

  // Solid background for dropdown
  const dropdownBg = isDark ? "#1a1a1a" : "#ffffff";
  const dropdownBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inp}
          placeholder="e.g. Dark psychology and human behavior"
        />
        <button
          onClick={getSuggestions}
          disabled={loading}
          title="Get AI-suggested niches"
          style={{
            width: "38px", height: "38px", borderRadius: "8px", flexShrink: 0,
            border: `1px solid rgba(124,58,237,0.4)`,
            background: "rgba(124,58,237,0.12)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#a78bfa",
          }}
        >
          {loading
            ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            : <RefreshCw size={14} />
          }
        </button>
      </div>

      {/* Suggestions dropdown — solid background */}
      {showSuggestions && suggestions.length > 0 && (
        <>
          {/* Backdrop to close */}
          <div
            onClick={() => setShowSuggestions(false)}
            style={{ position: "fixed", inset: 0, zIndex: 98 }}
          />
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: "46px",
            zIndex: 99,
            background: dropdownBg,
            border: `1px solid ${dropdownBorder}`,
            borderRadius: "10px",
            boxShadow: isDark
              ? "0 8px 32px rgba(0,0,0,0.6)"
              : "0 8px 32px rgba(0,0,0,0.15)",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "8px 12px 6px",
              borderBottom: `1px solid ${dropdownBorder}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <p style={{ fontSize: "10px", color: "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                ✨ Suggested Niches
              </p>
              <button onClick={() => setShowSuggestions(false)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: colors.textMuted, fontSize: "11px", padding: "0 2px",
              }}>✕</button>
            </div>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { onChange(s); setShowSuggestions(false); }}
                style={{
                  width: "100%", padding: "10px 14px", textAlign: "left",
                  background: "transparent", border: "none", cursor: "pointer",
                  fontSize: "13px", color: isDark ? "#e5e5e5" : "#111",
                  borderTop: i > 0 ? `1px solid ${dropdownBorder}` : "none",
                  display: "flex", alignItems: "center", gap: "8px",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,58,237,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <span style={{ color: "#a78bfa", fontSize: "12px" }}>→</span>
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}