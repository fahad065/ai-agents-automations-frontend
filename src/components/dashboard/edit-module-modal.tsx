"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  X, ChevronRight, ChevronLeft,
  Loader2, Check, Wand2, Calendar, Zap, Clock, Cpu,
} from "lucide-react";
import { NicheSuggester } from "./niche-suggester";

interface UserModule {
  _id: string;
  name: string;
  niche?: string;
  pipelineType: string;
  scheduleFrequency?: string;
  scheduleTime?: string;
  scheduleDays?: string[];
  customPrompt?: string;
  useCustomPrompt?: boolean;
  videoModel?: string;
}

interface VideoModel {
  id: string;
  name: string;
  provider: string;
  pricePerClip: number | null;
  desc: string;
  tags: string[];
  logo?: string | null;
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
  { value: "0", label: "Sun" }, { value: "1", label: "Mon" },
  { value: "2", label: "Tue" }, { value: "3", label: "Wed" },
  { value: "4", label: "Thu" }, { value: "5", label: "Fri" },
  { value: "6", label: "Sat" },
];

const FALLBACK_MODELS: VideoModel[] = [
  { id: "auto", name: "Auto (Recommended)", provider: "LogicMate", pricePerClip: null, desc: "Best model selected automatically", tags: [] },
  { id: "alibaba/wan-2.6/text-to-video", name: "Wan 2.6", provider: "Alibaba", pricePerClip: 0.35, desc: "Cost-effective, good quality", tags: [] },
  { id: "bytedance/seedance-2.0-fast/text-to-video", name: "Seedance 2.0 Fast", provider: "ByteDance", pricePerClip: 0.78, desc: "Higher quality, faster", tags: [] },
  { id: "bytedance/seedance-2.0/text-to-video", name: "Seedance 2.0", provider: "ByteDance", pricePerClip: 0.97, desc: "Best quality, premium", tags: [] },
];

export function EditModuleModal({ module, onClose, onSaved, onRunNow, colors, isDark }: Props) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savingRun, setSavingRun] = useState(false);
  const [models, setModels] = useState<VideoModel[]>(FALLBACK_MODELS);
  const [loadingModels, setLoadingModels] = useState(false);
  const [showAllModels, setShowAllModels] = useState(false);

  const [form, setForm] = useState({
    niche: module.niche || "",
    customPrompt: module.customPrompt || "",
    useCustomPrompt: module.useCustomPrompt || false,
    videoModel: (module as any).videoModel || "auto",
    scheduleFrequency: module.scheduleFrequency || "daily",
    scheduleTime: module.scheduleTime || "22:30",
    scheduleDays: (module as any).scheduleDays || ["1"],
  });

  const panelBg = isDark ? "#161616" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";
  const isManual = form.scheduleFrequency === "manual";

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  const fetchModels = useCallback(async () => {
    setLoadingModels(true);
    try {
      const res = await api.get(`/usermodules/atlas-models?type=${module.pipelineType}`);
      if (res.data?.models?.length > 0) {
        setModels(res.data.models as VideoModel[]);
      }
    } catch {
      // Keep fallback models
    }
    setLoadingModels(false);
  }, [module.pipelineType]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const to12hr = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const getNextRunPreview = () => {
    if (isManual) return null;
    const now = new Date();
    const [h, m] = form.scheduleTime.split(":").map(Number);
    if (form.scheduleFrequency === "daily") {
      const scheduled = new Date();
      scheduled.setHours(h, m, 0, 0);
      return `${scheduled > now ? "Today" : "Tomorrow"} at ${to12hr(form.scheduleTime)}`;
    }
    if (form.scheduleFrequency === "weekly") {
      const currentDay = now.getDay();
      const selectedDays = form.scheduleDays.map(Number).sort();
      if (!selectedDays.length) return null;
      let nextDay = selectedDays.find((d: number) => d > currentDay);
      let daysUntil: number;
      if (nextDay !== undefined) {
        daysUntil = nextDay - currentDay;
      } else {
        nextDay = selectedDays[0];
        daysUntil = 7 - currentDay + nextDay;
      }
      if (daysUntil === 0) {
        const scheduled = new Date();
        scheduled.setHours(h, m, 0, 0);
        if (scheduled > now) return `Today at ${to12hr(form.scheduleTime)}`;
        daysUntil = 7;
      }
      const label = daysUntil === 1 ? "Tomorrow" : DAYS_OF_WEEK.find(d => d.value === String(nextDay))?.label || "";
      return `${label} at ${to12hr(form.scheduleTime)}`;
    }
    return null;
  };

  const toggleDay = (day: string) => {
    setForm(f => {
      const days = f.scheduleDays.includes(day)
        ? f.scheduleDays.filter((d: string) => d !== day)
        : [...f.scheduleDays, day];
      return { ...f, scheduleDays: days.length === 0 ? [day] : days };
    });
  };

  const getPayload = () => ({
    niche: form.niche,
    scheduleFrequency: form.scheduleFrequency,
    scheduleTime: form.scheduleTime,
    scheduleDays: form.scheduleDays,
    customPrompt: form.customPrompt,
    useCustomPrompt: form.useCustomPrompt,
    videoModel: form.videoModel,
  });

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      await api.patch(`/usermodules/${module._id}`, getPayload());
      toast.success(isManual ? "Settings saved!" : `Schedule saved! Next run: ${getNextRunPreview() || "as scheduled"}`);
      onSaved(); onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save");
    }
    setSaving(false);
  };

  const handleSaveAndRun = async () => {
    setSavingRun(true);
    try {
      await api.patch(`/usermodules/${module._id}`, getPayload());
      onSaved(); onClose(); onRunNow();
      toast.success("Settings saved! Pipeline starting now...");
    } catch (err: any) {
      toast.error("Failed to save settings");
    }
    setSavingRun(false);
  };

  const summarySchedule = () => {
    if (isManual) return "Manual only";
    if (form.scheduleFrequency === "daily") return `Every day at ${to12hr(form.scheduleTime)}`;
    const dayLabels = form.scheduleDays
      .map((d: string) => DAYS_OF_WEEK.find(x => x.value === d)?.label)
      .filter(Boolean).join(", ");
    return `Every ${dayLabels} at ${to12hr(form.scheduleTime)}`;
  };

  const nextRun = getNextRunPreview();
  const selectedModel = models.find(m => m.id === form.videoModel) || models[0];
  const estimatedCost = form.videoModel === "auto"
    ? "~$3.00–$5.00"
    : selectedModel?.pricePerClip
      ? `~$${(selectedModel.pricePerClip * 12 + 0.50).toFixed(2)}`
      : "auto";

  const getModelIcon = (m: VideoModel) => {
    if (m.id === "auto") return "⚡";
    if (["Alibaba", "QWEN"].includes(m.provider)) return "🔮";
    if (m.provider === "BYTEDANCE") return "🎬";
    if (m.provider === "GOOGLE") return "🌐";
    return "🎥";
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 600,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: panelBg, border: `1px solid ${panelBorder}`,
        borderRadius: "18px", width: "100%", maxWidth: "620px",
        maxHeight: "92vh", display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: `1px solid ${panelBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <div>
              <p style={{ fontSize: "17px", fontWeight: 700, color: colors.text }}>{module.name}</p>
              <p style={{ fontSize: "12px", color: colors.textMuted }}>Configure your pipeline</p>
            </div>
            <button onClick={onClose} style={{
              width: "30px", height: "30px", borderRadius: "8px",
              border: `1px solid ${panelBorder}`, background: "transparent",
              color: colors.textMuted, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><X size={14} /></button>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <button onClick={() => setStep(i)} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "5px 10px", borderRadius: "20px", cursor: "pointer",
                  border: "none", background: step === i ? "rgba(124,58,237,0.15)" : "transparent",
                  color: step === i ? "#a78bfa" : step > i ? "#22c55e" : colors.textMuted,
                  fontSize: "12px", fontWeight: step === i ? 600 : 400, whiteSpace: "nowrap",
                }}>
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: step > i ? "#22c55e" : step === i ? "#7c3aed" : (isDark ? "#333" : "#e5e5e5"),
                    fontSize: "11px", fontWeight: 700, color: step >= i ? "white" : colors.textMuted,
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

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>

          {/* ── Step 0: Content ── */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* Niche */}
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

              {/* Video Model Selector */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: colors.textMuted, display: "flex", alignItems: "center", gap: "5px" }}>
                    <Cpu size={12} /> Video Generation Model
                  </label>
                  {loadingModels && (
                    <span style={{ fontSize: "10px", color: colors.textMuted, display: "flex", alignItems: "center", gap: "4px" }}>
                      <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> Fetching live models...
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {(showAllModels ? models : models.slice(0, 3)).map((m) => {
                    const selected = form.videoModel === m.id;
                    return (
                      <button key={m.id} onClick={() => setForm(f => ({ ...f, videoModel: m.id }))} style={{
                        padding: "10px 12px", borderRadius: "9px", cursor: "pointer", textAlign: "left",
                        border: `2px solid ${selected ? "#7c3aed" : colors.border}`,
                        background: selected ? "rgba(124,58,237,0.07)" : "transparent",
                        display: "flex", alignItems: "center", gap: "10px",
                        transition: "border-color 0.15s",
                      }}>
                        <div style={{
                          width: "28px", height: "28px", borderRadius: "7px", flexShrink: 0,
                          background: selected ? "rgba(124,58,237,0.15)" : colors.bg,
                          border: `1px solid ${selected ? "rgba(124,58,237,0.3)" : colors.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "13px",
                        }}>
                          {getModelIcon(m)}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <p style={{ fontSize: "12px", fontWeight: 600, color: selected ? "#a78bfa" : colors.text }}>
                              {m.name}
                            </p>
                            {m.tags.includes("HOT") && (
                              <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "4px", background: "rgba(239,68,68,0.12)", color: "#ef4444", fontWeight: 700 }}>HOT</span>
                            )}
                            {m.tags.includes("NEW") && (
                              <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "4px", background: "rgba(34,197,94,0.12)", color: "#22c55e", fontWeight: 700 }}>NEW</span>
                            )}
                          </div>
                          <p style={{ fontSize: "10px", color: colors.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {m.desc}
                          </p>
                        </div>

                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          {m.pricePerClip ? (
                            <p style={{ fontSize: "11px", fontWeight: 700, color: selected ? "#a78bfa" : colors.text }}>
                              ${(m.pricePerClip * 8).toFixed(2)}/video
                            </p>
                          ) : (
                            <p style={{ fontSize: "10px", color: "#22c55e", fontWeight: 600 }}>Smart</p>
                          )}
                        </div>

                        {selected && <Check size={13} color="#7c3aed" style={{ flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>

                {models.length > 3 && (
                  <button onClick={() => setShowAllModels(s => !s)} style={{
                    width: "100%", padding: "7px", marginTop: "6px",
                    borderRadius: "8px", cursor: "pointer", border: `1px dashed ${colors.border}`,
                    background: "transparent", color: colors.textMuted, fontSize: "11px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                  }}>
                    {showAllModels ? "▲ Show less" : `▼ Show ${models.length - 3} more models`}
                  </button>
                )}

                <p style={{
                  fontSize: "11px", color: colors.textMuted, marginTop: "8px",
                  padding: "7px 10px", background: "rgba(124,58,237,0.05)",
                  borderRadius: "7px", textAlign: "center",
                }}>
                  💡 Est. cost: <strong style={{ color: "#a78bfa" }}>{estimatedCost}</strong> per video (12 clips + OpenAI)
                </p>
              </div>

              {/* Custom scene toggle */}
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
                      <p style={{ fontSize: "11px", color: colors.textMuted }}>Describe what you want to see in the video</p>
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
                  <textarea
                    value={form.customPrompt}
                    onChange={(e) => setForm(f => ({ ...f, customPrompt: e.target.value }))}
                    placeholder="Example: A dark room with a single candle. Shadowy figure writing in a journal. Close-up of eyes darting nervously."
                    rows={4}
                    style={{ ...inp, resize: "vertical", lineHeight: 1.6, fontSize: "12px", marginTop: "4px" }}
                  />
                )}
              </div>
            </div>
          )}

          {/* ── Step 1: Schedule ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { value: "manual", label: "Manual only", desc: "You control when it runs", icon: "👆" },
                { value: "daily", label: "Daily", desc: "Runs every day at your chosen time", icon: "📅" },
                { value: "weekly", label: "Weekly", desc: "Runs on selected days each week", icon: "📆" },
              ].map((opt) => (
                <button key={opt.value} onClick={() => setForm(f => ({ ...f, scheduleFrequency: opt.value }))} style={{
                  padding: "12px 14px", borderRadius: "10px", cursor: "pointer", textAlign: "left",
                  border: `2px solid ${form.scheduleFrequency === opt.value ? "#7c3aed" : colors.border}`,
                  background: form.scheduleFrequency === opt.value ? "rgba(124,58,237,0.08)" : "transparent",
                  display: "flex", alignItems: "center", gap: "12px",
                }}>
                  <span style={{ fontSize: "22px" }}>{opt.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: form.scheduleFrequency === opt.value ? "#a78bfa" : colors.text }}>{opt.label}</p>
                    <p style={{ fontSize: "11px", color: colors.textMuted }}>{opt.desc}</p>
                  </div>
                  {form.scheduleFrequency === opt.value && <Check size={16} color="#7c3aed" />}
                </button>
              ))}

              {!isManual && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: colors.textMuted, marginBottom: "6px" }}>Run Time</label>
                  <input type="time" value={form.scheduleTime} onChange={(e) => setForm(f => ({ ...f, scheduleTime: e.target.value }))} style={inp} />
                </div>
              )}

              {form.scheduleFrequency === "weekly" && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: colors.textMuted, marginBottom: "8px" }}>Run on these days</label>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {DAYS_OF_WEEK.map((day) => {
                      const selected = form.scheduleDays.includes(day.value);
                      return (
                        <button key={day.value} onClick={() => toggleDay(day.value)} style={{
                          padding: "8px 14px", borderRadius: "8px", cursor: "pointer",
                          border: `2px solid ${selected ? "#7c3aed" : colors.border}`,
                          background: selected ? "#7c3aed" : "transparent",
                          color: selected ? "white" : colors.textMuted,
                          fontSize: "12px", fontWeight: selected ? 600 : 400, transition: "all 0.15s",
                        }}>{day.label}</button>
                      );
                    })}
                  </div>
                </div>
              )}

              {nextRun && (
                <div style={{
                  padding: "10px 14px", borderRadius: "8px",
                  background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)",
                  display: "flex", alignItems: "center", gap: "8px",
                }}>
                  <Clock size={13} color="#a78bfa" />
                  <p style={{ fontSize: "12px", color: "#a78bfa", fontWeight: 500 }}>Next run: {nextRun}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Launch ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ padding: "16px", borderRadius: "10px", background: colors.bg, border: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text, marginBottom: "12px" }}>Summary</p>
                {[
                  { label: "Niche", value: form.niche || "Not set" },
                  { label: "Video model", value: selectedModel?.name || "Auto" },
                  { label: "Est. cost/video", value: estimatedCost },
                  { label: "Custom scenes", value: form.useCustomPrompt ? "Yes — custom description" : "AI-generated" },
                  { label: "Schedule", value: summarySchedule() },
                  ...(nextRun ? [{ label: "Next run", value: nextRun }] : []),
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    padding: "8px 0", borderTop: i > 0 ? `1px solid ${colors.border}` : "none", gap: "16px",
                  }}>
                    <span style={{ fontSize: "12px", color: colors.textMuted, flexShrink: 0 }}>{item.label}</span>
                    <span style={{ fontSize: "12px", fontWeight: 500, color: colors.text, textAlign: "right" }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {isManual ? (
                <>
                  <button onClick={handleSaveAndRun} disabled={savingRun} style={{
                    padding: "14px", borderRadius: "10px", cursor: savingRun ? "not-allowed" : "pointer",
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white",
                    border: "none", fontSize: "14px", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    boxShadow: "0 4px 16px rgba(124,58,237,0.4)", opacity: savingRun ? 0.7 : 1,
                  }}>
                    {savingRun ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={16} />}
                    Save & Run Now
                  </button>
                  <button onClick={handleSaveSchedule} disabled={saving} style={{
                    padding: "11px", borderRadius: "10px", cursor: saving ? "not-allowed" : "pointer",
                    background: "transparent", color: colors.textMuted,
                    border: `1px solid ${colors.border}`, fontSize: "13px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    opacity: saving ? 0.7 : 1,
                  }}>
                    {saving && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
                    Save Only
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleSaveSchedule} disabled={saving} style={{
                    padding: "14px", borderRadius: "10px", cursor: saving ? "not-allowed" : "pointer",
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white",
                    border: "none", fontSize: "14px", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    boxShadow: "0 4px 16px rgba(124,58,237,0.4)", opacity: saving ? 0.7 : 1,
                  }}>
                    {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Calendar size={16} />}
                    Save Schedule
                  </button>
                  <button onClick={handleSaveAndRun} disabled={savingRun} style={{
                    padding: "11px", borderRadius: "10px", cursor: savingRun ? "not-allowed" : "pointer",
                    background: "transparent", color: colors.text,
                    border: `1px solid ${colors.border}`, fontSize: "13px", fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    opacity: savingRun ? 0.7 : 1,
                  }}>
                    {savingRun ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={13} />}
                    Also Run Now
                  </button>
                  {nextRun && (
                    <p style={{ fontSize: "11px", color: colors.textMuted, textAlign: "center" }}>
                      Cron will auto-run {nextRun}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer nav */}
        {step < 2 && (
          <div style={{ padding: "16px 28px", borderTop: `1px solid ${panelBorder}`, display: "flex", gap: "10px" }}>
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