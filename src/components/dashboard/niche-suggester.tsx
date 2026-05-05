// src/components/dashboard/niche-suggester.tsx
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

interface NicheSuggesterProps {
  value: string;
  onChange: (niche: string) => void;
  pipelineType?: string;
  colors: any;
}

export function NicheSuggester({ value, onChange, pipelineType = "youtube", colors }: NicheSuggesterProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inp = {
    width: "100%", padding: "9px 12px 9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  const getSuggestions = () => {
    setLoading(true);
    // Get niche list for pipeline type
    const list = NICHE_SUGGESTIONS[pipelineType] || NICHE_SUGGESTIONS.default;
    // Shuffle and pick 5
    const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, 5);
    setTimeout(() => {
      setSuggestions(shuffled);
      setShowSuggestions(true);
      setLoading(false);
    }, 400);
  };

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
          title="Get niche suggestions"
          style={{
            width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
            border: `1px solid ${colors.border}`, background: colors.bg,
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

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: "42px", zIndex: 100,
          background: colors.bgCard, border: `1px solid ${colors.border}`,
          borderRadius: "8px", marginTop: "4px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}>
          <p style={{ fontSize: "10px", color: colors.textMuted, padding: "8px 12px 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Suggested niches
          </p>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => { onChange(s); setShowSuggestions(false); }} style={{
              width: "100%", padding: "9px 12px", textAlign: "left",
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: "13px", color: colors.text,
              borderTop: i > 0 ? `1px solid ${colors.border}` : "none",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {s}
            </button>
          ))}
          <button onClick={() => setShowSuggestions(false)} style={{
            width: "100%", padding: "7px 12px", textAlign: "center",
            background: "transparent", border: "none", cursor: "pointer",
            borderTop: `1px solid ${colors.border}`,
            fontSize: "11px", color: colors.textMuted,
          }}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}