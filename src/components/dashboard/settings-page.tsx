"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import {
  User, Bell, Globe, Moon, Sun,
  Save, Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";

interface Profile {
  name: string;
  email: string;
  niche: string;
  timezone: string;
  scheduleTime: string;
  notifyOnComplete: boolean;
  notifyOnFail: boolean;
}

const TIMEZONES = [
  "Asia/Dubai", "Asia/Karachi", "Asia/Kolkata",
  "Europe/London", "Europe/Paris", "America/New_York",
  "America/Los_Angeles", "America/Chicago",
  "Australia/Sydney", "Asia/Tokyo", "Asia/Singapore",
];

function Section({
  title, icon: Icon, children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <div style={{
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: "12px", overflow: "hidden",
      marginBottom: "16px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "16px 20px",
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <Icon size={15} color="#a78bfa" />
        <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>
          {title}
        </h2>
      </div>
      <div style={{ padding: "20px" }}>
        {children}
      </div>
    </div>
  );
}

function Field({
  label, children, hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  const { colors } = useTheme();
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{
        display: "block", fontSize: "13px",
        fontWeight: 500, color: colors.text, marginBottom: "6px",
      }}>
        {label}
      </label>
      {children}
      {hint && (
        <p style={{
          fontSize: "11px", color: colors.textMuted,
          marginTop: "4px", lineHeight: 1.5,
        }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState<Profile>({
    name: "", email: "",
    niche: "dark psychology and human behavior",
    timezone: "Asia/Dubai",
    scheduleTime: "08:00",
    notifyOnComplete: true,
    notifyOnFail: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/profile");
      const u = res.data?.user || res.data;
      setProfile({
        name: u.name || "",
        email: u.email || "",
        niche: u.niche || "dark psychology and human behavior",
        timezone: u.timezone || "Asia/Dubai",
        scheduleTime: u.scheduleTime || "08:00",
        notifyOnComplete: u.notifyOnComplete !== false,
        notifyOnFail: u.notifyOnFail !== false,
      });
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const res = await api.patch("/users/profile", {
        name: profile.name,
        niche: profile.niche,
        timezone: profile.timezone,
        scheduleTime: profile.scheduleTime,
        notifyOnComplete: profile.notifyOnComplete,
        notifyOnFail: profile.notifyOnFail,
      });

      // Update auth store with new name
      if (user) {
        setAuth(
          { ...user, name: profile.name },
          localStorage.getItem("accessToken") || "",
          localStorage.getItem("refreshToken") || "",
        );
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save settings");
    }

    setSaving(false);
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px",
    borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`,
    background: colors.bg, color: colors.text,
    boxSizing: "border-box" as const,
    outline: "none",
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <Loader2 size={28} color="#7c3aed"
          style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "680px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{
          fontSize: "20px", fontWeight: 700,
          color: colors.text, marginBottom: "4px",
        }}>
          Settings
        </h1>
        <p style={{ fontSize: "14px", color: colors.textMuted }}>
          Manage your account and automation preferences.
        </p>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <Field label="Full name">
          <input
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            style={inputStyle}
            placeholder="Your full name"
          />
        </Field>
        <Field label="Email address" hint="Email cannot be changed. Contact support if needed.">
          <input
            value={profile.email}
            disabled
            style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }}
          />
        </Field>
      </Section>

      {/* Automation preferences */}
      <Section title="Automation preferences" icon={Globe}>
        <Field
          label="Default niche"
          hint="Used by all agents for trend discovery and script generation."
        >
          <input
            value={profile.niche}
            onChange={(e) => setProfile((p) => ({ ...p, niche: e.target.value }))}
            style={inputStyle}
            placeholder="e.g. dark psychology and human behavior"
          />
        </Field>

        <Field label="Timezone" hint="Used for scheduling pipeline runs.">
          <select
            value={profile.timezone}
            onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
            style={inputStyle}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </Field>

        <Field label="Default run time" hint="Time your pipeline will run automatically.">
          <input
            type="time"
            value={profile.scheduleTime}
            onChange={(e) => setProfile((p) => ({ ...p, scheduleTime: e.target.value }))}
            style={{ ...inputStyle, width: "160px" }}
          />
        </Field>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        {[
          {
            key: "notifyOnComplete" as const,
            label: "Pipeline complete",
            desc: "Email me when a video is uploaded to YouTube",
          },
          {
            key: "notifyOnFail" as const,
            label: "Pipeline failed",
            desc: "Email me if a pipeline run encounters an error",
          },
        ].map((item) => (
          <div key={item.key} style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
            borderBottom: `1px solid ${colors.border}`,
          }}>
            <div>
              <p style={{
                fontSize: "13px", fontWeight: 500,
                color: colors.text, marginBottom: "2px",
              }}>
                {item.label}
              </p>
              <p style={{ fontSize: "12px", color: colors.textMuted }}>
                {item.desc}
              </p>
            </div>
            <button
              onClick={() => setProfile((p) => ({
                ...p, [item.key]: !p[item.key],
              }))}
              style={{
                width: "44px", height: "24px",
                borderRadius: "12px", border: "none",
                cursor: "pointer", position: "relative",
                background: profile[item.key] ? "#7c3aed" : colors.border,
                transition: "background 0.2s", flexShrink: 0,
              }}
            >
              <div style={{
                width: "18px", height: "18px", borderRadius: "50%",
                background: "white",
                position: "absolute", top: "3px",
                left: profile[item.key] ? "23px" : "3px",
                transition: "left 0.2s",
              }} />
            </button>
          </div>
        ))}
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={isDark ? Moon : Sun}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <p style={{
              fontSize: "13px", fontWeight: 500,
              color: colors.text, marginBottom: "2px",
            }}>
              {isDark ? "Dark mode" : "Light mode"}
            </p>
            <p style={{ fontSize: "12px", color: colors.textMuted }}>
              Toggle between dark and light theme
            </p>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 14px", borderRadius: "8px",
              border: `1px solid ${colors.border}`,
              background: colors.bg, color: colors.text,
              cursor: "pointer", fontSize: "13px", fontWeight: 500,
            }}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            Switch to {isDark ? "light" : "dark"}
          </button>
        </div>
      </Section>

      {/* Save button */}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          fontSize: "13px", color: "#ef4444",
          marginBottom: "12px",
        }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 24px", borderRadius: "8px",
            background: saving
              ? "rgba(124,58,237,0.5)"
              : "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white", border: "none",
            cursor: saving ? "not-allowed" : "pointer",
            fontSize: "14px", fontWeight: 600,
            boxShadow: saving ? "none" : "0 4px 16px rgba(124,58,237,0.3)",
          }}
        >
          {saving
            ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
            : <Save size={15} />
          }
          {saving ? "Saving..." : "Save settings"}
        </button>

        {saved && (
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            fontSize: "13px", color: "#22c55e",
          }}>
            <CheckCircle2 size={14} /> Settings saved
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}