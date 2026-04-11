"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import {
  Plus, Pencil, Trash2, Loader2,
  CheckCircle2, XCircle, Boxes,
} from "lucide-react";

interface Module {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  capabilities: string[];
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  name: "", slug: "", description: "",
  category: "automation", capabilities: "",
  isActive: true,
};

export function AdminModules() {
  const { colors } = useTheme();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => { fetchModules(); }, []);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/modules");
      setModules(res.data || []);
    } catch {}
    setLoading(false);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (m: Module) => {
    setForm({
      name: m.name, slug: m.slug,
      description: m.description,
      category: m.category,
      capabilities: m.capabilities.join(", "),
      isActive: m.isActive,
    });
    setEditingId(m._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        capabilities: form.capabilities
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      };
      if (editingId) {
        await api.patch(`/admin/modules/${editingId}`, payload);
      } else {
        await api.post("/admin/modules", payload);
      }
      setShowForm(false);
      fetchModules();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this module? This cannot be undone.")) return;
    setDeleteLoading(id);
    try {
      await api.delete(`/admin/modules/${id}`);
      fetchModules();
    } catch {}
    setDeleteLoading(null);
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px",
    borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`,
    background: colors.bg, color: colors.text,
    boxSizing: "border-box" as const, outline: "none",
  };

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: "24px",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>
            Modules
          </h1>
          <p style={{ fontSize: "14px", color: colors.textMuted }}>
            Manage automation and agent templates available to users.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "9px 18px", borderRadius: "8px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white", border: "none", cursor: "pointer",
            fontSize: "14px", fontWeight: 600,
          }}
        >
          <Plus size={15} /> New module
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: colors.bgCard,
          border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: "12px", padding: "24px",
          marginBottom: "20px",
        }}>
          <h2 style={{
            fontSize: "15px", fontWeight: 600,
            color: colors.text, marginBottom: "16px",
          }}>
            {editingId ? "Edit module" : "Create module"}
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px", marginBottom: "12px",
          }}>
            <div>
              <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" }}>
                Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="YouTube Automation"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" }}>
                Slug *
              </label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                placeholder="youtube-automation"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                style={inputStyle}
              >
                <option value="automation">Automation</option>
                <option value="agent">Agent</option>
                <option value="tool">Tool</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe what this module does..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" as const }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" }}>
              Capabilities (comma-separated)
            </label>
            <input
              value={form.capabilities}
              onChange={(e) => setForm((f) => ({ ...f, capabilities: e.target.value }))}
              placeholder="Trend discovery, Video generation, Auto upload"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                style={{ accentColor: "#7c3aed" }}
              />
              <span style={{ fontSize: "13px", color: colors.text }}>Active (visible to users)</span>
            </label>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              style={{
                padding: "9px 20px", borderRadius: "8px",
                background: "#7c3aed", color: "white",
                border: "none", cursor: saving ? "not-allowed" : "pointer",
                fontSize: "13px", fontWeight: 600,
                display: "flex", alignItems: "center", gap: "6px",
                opacity: saving || !form.name.trim() ? 0.6 : 1,
              }}
            >
              {saving && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
              {editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: "9px 16px", borderRadius: "8px",
                border: `1px solid ${colors.border}`,
                background: "none", color: colors.textMuted,
                cursor: "pointer", fontSize: "13px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modules grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <Loader2 size={24} color="#7c3aed"
            style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      ) : modules.length === 0 ? (
        <div style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: "12px", padding: "60px",
          textAlign: "center",
        }}>
          <Boxes size={36} color={colors.textMuted} style={{ margin: "0 auto 16px" }} />
          <p style={{ color: colors.textMuted, marginBottom: "16px" }}>No modules yet</p>
          <button onClick={openCreate} style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 18px", borderRadius: "8px",
            background: "#7c3aed", color: "white",
            border: "none", cursor: "pointer",
            fontSize: "13px", fontWeight: 600,
          }}>
            <Plus size={14} /> Create first module
          </button>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
        }}>
          {modules.map((m) => (
            <div key={m._id} style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px", padding: "20px",
            }}>
              <div style={{
                display: "flex", alignItems: "flex-start",
                justifyContent: "space-between", marginBottom: "10px",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: colors.text }}>
                      {m.name}
                    </p>
                    {m.isActive
                      ? <CheckCircle2 size={13} color="#22c55e" />
                      : <XCircle size={13} color="#ef4444" />
                    }
                  </div>
                  <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "monospace" }}>
                    {m.slug}
                  </p>
                </div>
                <span style={{
                  fontSize: "10px", fontWeight: 600, padding: "2px 8px",
                  borderRadius: "9999px",
                  background: "rgba(124,58,237,0.1)", color: "#a78bfa",
                }}>
                  {m.category}
                </span>
              </div>

              <p style={{
                fontSize: "12px", color: colors.textMuted,
                lineHeight: 1.6, marginBottom: "12px",
              }}>
                {m.description || "No description"}
              </p>

              {m.capabilities?.length > 0 && (
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: "4px",
                  marginBottom: "14px",
                }}>
                  {m.capabilities.slice(0, 4).map((c) => (
                    <span key={c} style={{
                      fontSize: "10px", padding: "2px 8px",
                      borderRadius: "9999px",
                      background: colors.bgSecondary,
                      border: `1px solid ${colors.border}`,
                      color: colors.textMuted,
                    }}>
                      {c}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => openEdit(m)}
                  style={{
                    flex: 1, padding: "7px",
                    borderRadius: "7px", fontSize: "12px",
                    fontWeight: 500, cursor: "pointer",
                    border: `1px solid ${colors.border}`,
                    background: colors.bg, color: colors.textMuted,
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: "4px",
                  }}
                >
                  <Pencil size={11} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(m._id)}
                  disabled={deleteLoading === m._id}
                  style={{
                    width: "32px", height: "32px", borderRadius: "7px",
                    border: "1px solid rgba(239,68,68,0.2)",
                    background: "rgba(239,68,68,0.06)", color: "#ef4444",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {deleteLoading === m._id
                    ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                    : <Trash2 size={12} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}