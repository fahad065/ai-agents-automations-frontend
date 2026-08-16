"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import { Plus, Pencil, Loader2, Package, X, Check, Globe } from "lucide-react";
import { toast } from "sonner";

interface Module {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  moduleType: string;
}

interface Industry {
  _id: string;
  slug: string;
  name: string;
  name_ar?: string;
  icon: string;
  color: string;
  description?: string;
  description_ar?: string;
  availableIn: string[];
  sortOrder: number;
  isActive: boolean;
  defaultModuleIds: (string | Module)[];
}

const emptyForm = {
  slug: "", name: "", name_ar: "",
  icon: "🏢", color: "#7c3aed",
  description: "", description_ar: "",
  availableIn: ["UAE"] as string[],
  sortOrder: 1, isActive: true,
  defaultModuleIds: [] as string[],
};

export function AdminIndustries() {
  const { colors } = useTheme();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activeTab, setActiveTab] = useState<"details" | "arabic" | "modules">("details");
  const [moduleSearch, setModuleSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [indRes, modRes] = await Promise.all([
        api.get("/industries"),
        api.get("/modules?limit=200"),
      ]);
      setIndustries(indRes.data || []);
      setAllModules((modRes.data?.data || modRes.data) || []);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setActiveTab("details");
    setShowForm(true);
  };

  const openEdit = (ind: Industry) => {
    setForm({
      slug: ind.slug,
      name: ind.name,
      name_ar: ind.name_ar || "",
      icon: ind.icon,
      color: ind.color,
      description: ind.description || "",
      description_ar: ind.description_ar || "",
      availableIn: ind.availableIn || ["UAE"],
      sortOrder: ind.sortOrder || 1,
      isActive: ind.isActive ?? true,
      defaultModuleIds: ind.defaultModuleIds.map((m: any) => m._id || m),
    });
    setEditingId(ind._id);
    setActiveTab("details");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        name_ar: form.name_ar.trim() || undefined,
        slug: form.slug.toLowerCase().replace(/\s+/g, "_"),
        icon: form.icon.trim(),
        color: form.color.trim(),
        description: form.description.trim() || undefined,
        description_ar: form.description_ar.trim() || undefined,
        availableIn: form.availableIn,
        sortOrder: Number(form.sortOrder),
        isActive: form.isActive,
        defaultModuleIds: form.defaultModuleIds,
      };
      if (editingId) {
        await api.patch(`/industries/${form.slug}`, payload);
        toast.success("Industry updated ✅");
      } else {
        await api.post("/industries", payload);
        toast.success("Industry created ✅");
      }
      setShowForm(false);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const toggleModule = (id: string) => {
    setForm(f => ({
      ...f,
      defaultModuleIds: f.defaultModuleIds.includes(id)
        ? f.defaultModuleIds.filter(m => m !== id)
        : [...f.defaultModuleIds, id],
    }));
  };

  const toggleCountry = (c: string) => {
    setForm(f => ({
      ...f,
      availableIn: f.availableIn.includes(c)
        ? f.availableIn.filter(x => x !== c)
        : [...f.availableIn, c],
    }));
  };

  const border = colors.border || (colors as any).isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  const inp: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: "8px",
    border: `1px solid ${border}`, background: colors.bg,
    color: colors.text, fontSize: "13px", outline: "none",
    boxSizing: "border-box",
  };

  const lbl = (text: string, hint?: string) => (
    <label style={{ fontSize: "11px", fontWeight: 600, color: colors.textMuted, display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {text} {hint && <span style={{ fontWeight: 400, textTransform: "none" }}>({hint})</span>}
    </label>
  );

  const fld = (children: React.ReactNode, full = false) => (
    <div style={{ gridColumn: full ? "1/-1" : undefined, marginBottom: "16px" }}>
      {children}
    </div>
  );

  const filteredModules = allModules.filter(m =>
    m.name.toLowerCase().includes(moduleSearch.toLowerCase()) ||
    m.slug.toLowerCase().includes(moduleSearch.toLowerCase())
  );

  return (
    <div style={{ padding: "24px", maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>Industries</h1>
          <p style={{ fontSize: "13px", color: colors.textMuted }}>Manage industry bundles and their default module assignments.</p>
        </div>
        <button onClick={openNew} style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "9px 18px", borderRadius: "9px",
          background: "#7c3aed", color: "white",
          border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
        }}>
          <Plus size={14} /> Add Industry
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <Loader2 size={24} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div style={{ border: `1px solid ${border}`, borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: (colors as any).isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
                {["Industry", "Slug", "Countries", "Default Modules", "Sort", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {industries.map((ind, i) => (
                <tr key={ind._id} style={{ borderBottom: i < industries.length - 1 ? `1px solid ${border}` : "none" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "9px", flexShrink: 0,
                        background: `${ind.color}15`, border: `1px solid ${ind.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
                      }}>{ind.icon}</div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>{ind.name}</p>
                        {ind.name_ar && <p style={{ fontSize: "11px", color: colors.textMuted, direction: "rtl" }}>{ind.name_ar}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <code style={{ fontSize: "11px", color: "#a78bfa", background: "rgba(124,58,237,0.1)", padding: "2px 7px", borderRadius: "4px" }}>{ind.slug}</code>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {ind.availableIn.map(c => (
                        <span key={c} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "9999px", background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)", fontWeight: 600 }}>{c}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Package size={12} color={colors.textMuted} />
                      <span style={{ fontSize: "13px", color: colors.textMuted }}>{ind.defaultModuleIds.length} modules</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "13px", color: colors.textMuted }}>{ind.sortOrder}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{
                      fontSize: "11px", padding: "3px 9px", borderRadius: "9999px", fontWeight: 600,
                      background: ind.isActive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
                      color: ind.isActive ? "#22c55e" : "#ef4444",
                    }}>{ind.isActive ? "Active" : "Inactive"}</span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => openEdit(ind)} style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "6px 12px", borderRadius: "7px",
                      border: `1px solid ${border}`, background: "transparent",
                      color: colors.textMuted, cursor: "pointer", fontSize: "12px",
                    }}>
                      <Pencil size={11} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: "20px",
        }}>
          <div style={{
            background: colors.bg, borderRadius: "16px",
            border: `1px solid ${border}`,
            width: "100%", maxWidth: "680px",
            maxHeight: "90vh", display: "flex", flexDirection: "column",
            boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: `1px solid ${border}` }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: colors.text }}>
                {editingId ? `Edit: ${form.name}` : "New Industry"}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted }}>
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${border}`, paddingLeft: "24px", flexShrink: 0 }}>
              {(["details", "arabic", "modules"] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  padding: "11px 16px", fontSize: "13px",
                  fontWeight: activeTab === t ? 600 : 400,
                  color: activeTab === t ? "#a78bfa" : colors.textMuted,
                  background: "transparent", border: "none",
                  borderBottom: `2px solid ${activeTab === t ? "#7c3aed" : "transparent"}`,
                  cursor: "pointer", textTransform: "capitalize",
                }}>
                  {t === "arabic" ? "🇦🇪 Arabic" : t === "modules" ? `Modules (${form.defaultModuleIds.length})` : t}
                </button>
              ))}
            </div>

            {/* Body */}
            <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>

              {/* DETAILS TAB */}
              {activeTab === "details" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  {fld(<>{lbl("Name *")}<input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Real Estate" style={inp} /></>)}
                  {fld(<>{lbl("Slug *")}<input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "_") }))} placeholder="real_estate" style={inp} /></>)}
                  {fld(<>{lbl("Icon", "emoji")}<input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🏢" style={inp} /></>)}
                  {fld(<>
                    {lbl("Color", "hex")}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: "44px", height: "36px", borderRadius: "8px", border: `1px solid ${border}`, cursor: "pointer", padding: "2px" }} />
                      <input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ ...inp, flex: 1 }} />
                    </div>
                  </>)}
                  {fld(<>{lbl("Sort Order")}<input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} style={inp} /></>)}
                  {fld(<>
                    {lbl("Countries")}
                    <div style={{ display: "flex", gap: "8px" }}>
                      {["UAE", "Kenya"].map(c => (
                        <button key={c} onClick={() => toggleCountry(c)} style={{
                          padding: "7px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600,
                          border: `1px solid ${form.availableIn.includes(c) ? "#22c55e" : border}`,
                          background: form.availableIn.includes(c) ? "rgba(34,197,94,0.1)" : "transparent",
                          color: form.availableIn.includes(c) ? "#22c55e" : colors.textMuted,
                        }}>{c}</button>
                      ))}
                    </div>
                  </>)}
                  {fld(<>
                    {lbl("Description")}
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inp, resize: "vertical" as const }} />
                  </>, true)}
                  {fld(<>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: colors.text }}>
                      <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ accentColor: "#7c3aed" }} />
                      Active (visible to users)
                    </label>
                  </>, true)}
                </div>
              )}

              {/* ARABIC TAB */}
              {activeTab === "arabic" && (
                <div>
                  <div style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "10px", padding: "14px", marginBottom: "20px" }}>
                    <p style={{ fontSize: "12px", color: "#a78bfa", fontWeight: 600, marginBottom: "4px" }}>🇦🇪 Arabic (UAE) Content</p>
                    <p style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.7 }}>These fields are shown when the portal language is set to Arabic (AR). Leave blank to fall back to English.</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                    {fld(<>
                      {lbl("Name (AR) — الاسم")}
                      <input value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} placeholder="العقارات" dir="rtl" style={{ ...inp, fontFamily: "inherit" }} />
                    </>)}
                    {fld(<>
                      {lbl("Description (AR) — الوصف")}
                      <textarea value={form.description_ar} onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))} rows={4} placeholder="وصف الصناعة بالعربية..." dir="rtl" style={{ ...inp, resize: "vertical" as const, fontFamily: "inherit" }} />
                    </>)}
                  </div>
                </div>
              )}

              {/* MODULES TAB */}
              {activeTab === "modules" && (
                <div>
                  <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
                    <p style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 600, marginBottom: "4px" }}>
                      <Package size={11} style={{ display: "inline", marginRight: "4px" }} />
                      Default Modules ({form.defaultModuleIds.length} selected)
                    </p>
                    <p style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.7 }}>
                      These modules are automatically included when a user subscribes to this industry. Users can add more on top.
                    </p>
                  </div>
                  <input
                    value={moduleSearch}
                    onChange={e => setModuleSearch(e.target.value)}
                    placeholder="Search modules..."
                    style={{ ...inp, marginBottom: "14px" }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "340px", overflowY: "auto" }}>
                    {filteredModules.map(m => {
                      const selected = form.defaultModuleIds.includes(m._id);
                      return (
                        <div key={m._id} onClick={() => toggleModule(m._id)} style={{
                          display: "flex", alignItems: "center", gap: "12px",
                          padding: "10px 14px", borderRadius: "9px", cursor: "pointer",
                          border: `1px solid ${selected ? "rgba(124,58,237,0.35)" : border}`,
                          background: selected ? "rgba(124,58,237,0.07)" : "transparent",
                          transition: "all 0.15s",
                        }}>
                          <div style={{
                            width: "20px", height: "20px", borderRadius: "4px",
                            border: `2px solid ${selected ? "#7c3aed" : border}`,
                            background: selected ? "#7c3aed" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}>
                            {selected && <Check size={11} color="white" strokeWidth={3} />}
                          </div>
                          <span style={{ fontSize: "16px" }}>{m.icon}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text }}>{m.name}</p>
                            <p style={{ fontSize: "11px", color: colors.textMuted }}>{m.moduleType} · {m.slug}</p>
                          </div>
                          {selected && <Globe size={13} color="#7c3aed" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: "flex", gap: "8px", padding: "16px 24px", borderTop: `1px solid ${border}`, flexShrink: 0 }}>
              <button onClick={() => setShowForm(false)} style={{
                flex: 1, padding: "10px", borderRadius: "9px",
                border: `1px solid ${border}`, background: "transparent",
                color: colors.textMuted, cursor: "pointer", fontSize: "13px",
              }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 2, padding: "10px", borderRadius: "9px",
                background: "#7c3aed", color: "white", border: "none",
                cursor: saving ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}>
                {saving ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving...</> : "Save Industry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
