"use client";

import { useTheme } from "@/hooks/use-theme";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export function FormField({
  label, type = "text", placeholder,
  value, onChange, error, disabled, autoComplete,
}: FormFieldProps) {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{
        display: "block", fontSize: "13px",
        fontWeight: 500, color: colors.text,
        marginBottom: "6px",
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          style={{
            width: "100%", padding: "10px 14px",
            paddingRight: isPassword ? "44px" : "14px",
            borderRadius: "8px", fontSize: "14px",
            border: `1px solid ${error ? "#ef4444" : colors.border}`,
            background: colors.bg,
            color: colors.text, outline: "none",
            transition: "border-color 0.2s",
            boxSizing: "border-box",
            opacity: disabled ? 0.6 : 1,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? "#ef4444" : "#7c3aed";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? "#ef4444" : colors.border;
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute", right: "12px", top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none",
              cursor: "pointer", color: colors.textMuted,
              display: "flex", alignItems: "center",
            }}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && (
        <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
          {error}
        </p>
      )}
    </div>
  );
}