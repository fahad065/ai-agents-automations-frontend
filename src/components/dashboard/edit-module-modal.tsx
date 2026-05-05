"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  X, ChevronRight, ChevronLeft,
  Loader2, Check, Wand2, Calendar, Zap, Clock,
} from "lucide-react";
import { NicheSuggester } from "./niche-suggester";

interface UserModule {
  _id: string;
  name: string;
  niche?: string;
  pipelineType: string;
  scheduleFrequency?: string;
  scheduleTime?: string;
  scheduleDays?: string[]; // NEW — for weekly multi-day
  customPrompt?: string;
  useCustomPrompt?: boolean;
}

interface Props {
  module: UserModule;
  onClose: () => void;
  onSaved: () => void;
  onRunNow: () => void;
  colors: any;
  isDark: boolean;
}

const STEPS = ["Content", "Schedule", "Launch"];

const DAYS_OF_WEEK = [
  { value: "0", label: "Sun" },
  { value: "1", label: "Mon" },
  { value: "2", label: "Tue" },
  { value: "3", label: "Wed" },
  { value: "4", label: "Thu" },
  { value: "5", label: "Fri" },
  { value: "6", label: "Sat" },
];

export function EditModuleModal({ module, onClose, onSaved, onRunNow, colors, isDark }: Props) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    niche: module.niche || "",
    customPrompt: module.customPrompt || "",
    useCustomPrompt: module.useCustomPrompt || false,
    scheduleFrequency: module.scheduleFrequency || "daily",
    scheduleTime: module.scheduleTime || "22:30",
    scheduleDays: (module as any).scheduleDays || ["1"], // default Monday
  });

  const panelBg = isDark ? "#161616" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  // ── Next run preview ──────────────────────────────────────
  const getNextRunPreview = () => {
    if (form.scheduleFrequency === "manual") return null;

    const now = new Date();
    const [h, m] = form.scheduleTime.split(":").map(Number);

    if (form.scheduleFrequency === "daily") {
      const scheduled = new Date();
      scheduled.setHours(h, m, 0, 0);
      const isToday = scheduled > now;
      const label = isToday ? "Today" : "Tomorrow";
      return `${label} at ${to12hr(form.scheduleTime)}`;
    }

    if (form.scheduleFrequency === "weekly") {
      const currentDay = now.getDay();
      const selectedDays = form.scheduleDays.map(Number).sort();
      if (selectedDays.length === 0) return null;

      // Find next upcoming day
      let nextDay = selectedDays.find((d: number) => d > currentDay);
      let daysUntil: number;
      let label: string;

      if (nextDay !== undefined) {
        daysUntil = nextDay - currentDay;
      } else {
        // Wrap around to next week
        nextDay = selectedDays[0];
        daysUntil = 7 - currentDay + nextDay;
      }

      // Check if it's today and time hasn't passed
      if (daysUntil === 0) {
        const scheduled = new Date();
        scheduled.setHours(h, m, 0, 0);
        if (scheduled > now) {
          label = "Today";
        } else {
          daysUntil = 7;
          label = DAYS_OF_WEEK.find(d => d.value === String(nextDay))?.label || "";
        }
      } else if (daysUntil === 1) {
        label = "Tomorrow";
      } else {
        label = DAYS_OF_WEEK.find(d => d.value === String(nextDay))?.label || "";
      }

      return `${label} at ${to12hr(form.scheduleTime)}`;
    }

    return null;
  };

  const to12hr = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const toggleDay = (day: string) => {
    setForm(f => {
      const days = f.scheduleDays.includes(day)
        ? f.scheduleDays.filter((d: string) => d !== day)
        : [...f.scheduleDays, day];
      return { ...f, scheduleDays: days.length === 0 ? [day] : days }; // keep at least 1
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/usermodules/${module._id}`, {
        niche: form.niche,
        scheduleFrequency: form.scheduleFrequency,
        scheduleTime: form.scheduleTime,
        scheduleDays: form.scheduleDays,
        customPrompt: form.customPrompt,
        useCustomPrompt: form.useCustomPrompt,
      });
      toast.success("Module settings saved!");
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save");
    }
    setSaving(false);
  };

  const handleSaveAndRun = async () => {
    setSaving(true);
    try {
      await api.patch(`/usermodules/${module._id}`, {
        niche: form.niche,
        scheduleFrequency: form.scheduleFrequency,
        scheduleTime: form.scheduleTime,
        scheduleDays: form.scheduleDays,
        customPrompt: form.customPrompt,
        useCustomPrompt: form.useCustomPrompt,
      });
      onSaved();
      onClose();
      onRunNow();
      toast.success("Settings saved! Pipeline starting...");
    } catch (err: any) {
      toast.error("Failed to save settings");
    }
    setSaving(false);
  };

  const nextRunPreview = getNextRunPreview();

  const summarySchedule = () => {
    if (form.scheduleFrequency === "manual") return "Manual only";
    if (form.scheduleFrequency === "daily") return `Daily at ${to12hr(form.scheduleTime)}`;
    const dayLabels = form.scheduleDays
      .map((d: string) => DAYS_OF_WEEK.find(x => x.value === d)?.label)
      .filter(Boolean).join(", ");
    return `Weekly on ${dayLabels} at ${to12hr(form.scheduleTime)}`;
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 600,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: panelBg, border: `1px solid ${panelBorder}`,
        borderRadius: "18px", width: "100%", maxWidth: "500px",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${panelBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: colors.text }}>{module.name}</p>
              <p style={{ fontSize: "12px", color: colors.textMuted }}>Configure your pipeline</p>
            </div>
            <button onClick={onClose} style={{
              width: "28px", height: "28px", borderRadius: "7px",
              border: `1px solid ${panelBorder}`, background: "transparent",
              color: colors.textMuted, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><X size={13} /></button>
          </div>

          {/* Step indicators */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <button onClick={() => setStep(i)} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "5px 8px", borderRadius: "20px", cursor: "pointer",
                  border: "none", background: step === i ? "rgba(124,58,237,0.15)" : "transparent",
                  color: step === i ? "#a78bfa" : step > i ? "#22c55e" : colors.textMuted,
                  fontSize: "12px", fontWeight: step === i ? 600 : 400,
                  whiteSpace: "nowrap",
                }}>
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: step > i ? "#22c55e" : step === i ? "#7c3aed" : (isDark ? "#333" : "#e5e5e5"),
                    fontSize: "10px", fontWeight: 700, color: step >= i ? "white" : colors.textMuted,
                  }}>
                    {step > i ? <Check size={11} /> : i + 1}
                  </div>
                  {s}
                </button>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: "1px", background: step > i ? "#22c55e" : (isDark ? "#333" : "#e5e5e5"), minWidth: "12px" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>

          {/* Step 0 — Content */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: colors.textMuted, marginBottom: "6px" }}>
                  Content Niche
                </label>
                <NicheSuggester
                  value={form.niche}
                  onChange={(v) => setForm(f => ({ ...f, niche: v }))}
                  pipelineType={module.pipelineType}
                  colors={colors}
                  isDark={isDark}
                />
                <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "4px" }}>
                  Click 🔄 for AI-suggested niches
                </p>
              </div>

              {/* Custom scene description toggle */}
              <div style={{
                padding: "14px", borderRadius: "10px",
                border: `1px solid ${form.useCustomPrompt ? "rgba(124,58,237,0.3)" : colors.border}`,
                background: form.useCustomPrompt ? "rgba(124,58,237,0.05)" : "transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: form.useCustomPrompt ? "12px" : "0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Wand2 size={14} color={form.useCustomPrompt ? "#a78bfa" : colors.textMuted} />
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>Custom Scene Description</p>
                      <p style={{ fontSize: "11px", color: colors.textMuted }}>Describe exactly what you want to see</p>
                    </div>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, useCustomPrompt: !f.useCustomPrompt }))} style={{
                    width: "40px", height: "22px", borderRadius: "11px", cursor: "pointer", border: "none",
                    background: form.useCustomPrompt ? "#7c3aed" : (isDark ? "#333" : "#ccc"),
                    position: "relative", transition: "background 0.2s", flexShrink: 0,
                  }}>
                    <div style={{
                      width: "16px", height: "16px", borderRadius: "50%", background: "white",
                      position: "absolute", top: "3px",
                      left: form.useCustomPrompt ? "21px" : "3px",
                      transition: "left 0.2s",
                    }} />
                  </button>
                </div>

                {form.useCustomPrompt && (
                  <div>
                    <textarea
                      value={form.customPrompt}
                      onChange={(e) => setForm(f => ({ ...f, customPrompt: e.target.value }))}
                      placeholder={"Describe your video scenes...\n\nExample: A dark room with a single flickering candle. A shadowy figure writing in a journal. Close-up of eyes darting nervously."}
                      rows={5}
                      style={{ ...inp, resize: "vertical", lineHeight: 1.6, fontSize: "12px" }}
                    />
                    <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "6px" }}>
                      Leave empty to use AI-generated scenes for your niche.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 1 — Schedule */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Frequency options */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { value: "manual", label: "Manual only", desc: "Run whenever you click Run Now", icon: "👆" },
                  { value: "daily", label: "Daily", desc: "Runs every day at selected time", icon: "📅" },
                  { value: "weekly", label: "Weekly", desc: "Runs on selected days each week", icon: "📆" },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => setForm(f => ({ ...f, scheduleFrequency: opt.value }))} style={{
                    padding: "12px 14px", borderRadius: "10px", cursor: "pointer", textAlign: "left",
                    border: `2px solid ${form.scheduleFrequency === opt.value ? "#7c3aed" : colors.border}`,
                    background: form.scheduleFrequency === opt.value ? "rgba(124,58,237,0.08)" : "transparent",
                    display: "flex", alignItems: "center", gap: "12px",
                  }}>
                    <span style={{ fontSize: "20px" }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: form.scheduleFrequency === opt.value ? "#a78bfa" : colors.text }}>
                        {opt.label}
                      </p>
                      <p style={{ fontSize: "11px", color: colors.textMuted }}>{opt.desc}</p>
                    </div>
                    {form.scheduleFrequency === opt.value && <Check size={16} color="#7c3aed" />}
                  </button>
                ))}
              </div>

              {/* Time picker */}
              {form.scheduleFrequency !== "manual" && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: colors.textMuted, marginBottom: "6px" }}>
                    Run Time
                  </label>
                  <input
                    type="time"
                    value={form.scheduleTime}
                    onChange={(e) => setForm(f => ({ ...f, scheduleTime: e.target.value }))}
                    style={inp}
                  />
                </div>
              )}

              {/* Day picker for weekly */}
              {form.scheduleFrequency === "weekly" && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: colors.textMuted, marginBottom: "8px" }}>
                    Run on these days
                  </label>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {DAYS_OF_WEEK.map((day) => {
                      const selected = form.scheduleDays.includes(day.value);
                      return (
                        <button key={day.value} onClick={() => toggleDay(day.value)} style={{
                          padding: "7px 12px", borderRadius: "8px", cursor: "pointer",
                          border: `2px solid ${selected ? "#7c3aed" : colors.border}`,
                          background: selected ? "#7c3aed" : "transparent",
                          color: selected ? "white" : colors.textMuted,
                          fontSize: "12px", fontWeight: selected ? 600 : 400,
                          transition: "all 0.15s",
                        }}>
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "6px" }}>
                    Select one or more days. At least one day required.
                  </p>
                </div>
              )}

              {/* Next run preview */}
              {nextRunPreview && (
                <div style={{
                  padding: "10px 14px", borderRadius: "8px",
                  background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)",
                  display: "flex", alignItems: "center", gap: "8px",
                }}>
                  <Clock size={13} color="#a78bfa" />
                  <p style={{ fontSize: "12px", color: "#a78bfa", fontWeight: 500 }}>
                    Next run: {nextRunPreview}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Launch */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Summary */}
              <div style={{ padding: "16px", borderRadius: "10px", background: colors.bg, border: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text, marginBottom: "12px" }}>Summary</p>
                {[
                  { label: "Niche", value: form.niche || "Not set" },
                  { label: "Custom scenes", value: form.useCustomPrompt ? "Yes — custom description" : "AI-generated" },
                  { label: "Schedule", value: summarySchedule() },
                  ...(nextRunPreview ? [{ label: "Next run", value: nextRunPreview }] : []),
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    padding: "8px 0", borderTop: i > 0 ? `1px solid ${colors.border}` : "none", gap: "12px",
                  }}>
                    <span style={{ fontSize: "12px", color: colors.textMuted, flexShrink: 0 }}>{item.label}</span>
                    <span style={{ fontSize: "12px", fontWeight: 500, color: colors.text, textAlign: "right" }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <button onClick={handleSaveAndRun} disabled={saving} style={{
                padding: "14px", borderRadius: "10px", cursor: saving ? "not-allowed" : "pointer",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white",
                border: "none", fontSize: "14px", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "0 4px 16px rgba(124,58,237,0.4)", opacity: saving ? 0.7 : 1,
              }}>
                {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={16} />}
                Save & Run Now
              </button>

              <button onClick={handleSave} disabled={saving} style={{
                padding: "12px", borderRadius: "10px", cursor: saving ? "not-allowed" : "pointer",
                background: "transparent", color: colors.text,
                border: `1px solid ${colors.border}`, fontSize: "13px", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                opacity: saving ? 0.7 : 1,
              }}>
                <Calendar size={14} />
                Save & Schedule Only
              </button>

              <p style={{ fontSize: "11px", color: colors.textMuted, textAlign: "center" }}>
                "Run Now" starts immediately. "Schedule Only" saves for cron.
              </p>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {step < 2 && (
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${panelBorder}`, display: "flex", gap: "10px" }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer",
                border: `1px solid ${panelBorder}`, background: "transparent",
                color: colors.textMuted, fontSize: "13px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}>
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <button onClick={() => setStep(s => s + 1)} style={{
              flex: 2, padding: "10px", borderRadius: "8px", cursor: "pointer",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "white", border: "none", fontSize: "13px", fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}