"use client";

import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function SubmitButton({
  label, loading, disabled, onClick,
}: SubmitButtonProps) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        width: "100%", padding: "11px",
        borderRadius: "8px", fontSize: "14px",
        fontWeight: 600, color: "white",
        background: loading || disabled
          ? "rgba(124,58,237,0.5)"
          : "linear-gradient(135deg, #7c3aed, #6d28d9)",
        border: "none", cursor: loading || disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center",
        justifyContent: "center", gap: "8px",
        transition: "all 0.2s",
        boxShadow: loading || disabled ? "none" : "0 4px 16px rgba(124,58,237,0.3)",
      }}
    >
      {loading && <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />}
      {label}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}