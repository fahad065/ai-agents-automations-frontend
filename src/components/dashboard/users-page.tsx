"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Users, Search, Eye, Pencil, Trash2,
  Loader2, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Shield, User,
  Mail, Phone, Globe, CreditCard, X,
  Save, AlertTriangle, RefreshCw, Filter,
} from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isDeleted: boolean;
  planType: string;
  phoneNumber?: string;
  country?: string;
  totalAgents?: number;
  totalAutomations?: number;
  totalBilled?: number;
  trialEndDate?: string;
  createdAt: string;
  provider: string;
}

const PLAN_COLORS: Record<string, { color: string; bg: string }> = {
  trial:        { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  paid:         { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  free_forever: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  expired:      { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const PLAN_LABELS: Record<string, string> = {
  trial: "Free Trial", paid: "Pro",
  free_forever: "Free Forever", expired: "Expired",
};

// ── View/Edit User Modal ──────────────────────────────────────
function UserModal({ user, onClose, onSave, colors, isDark }: {
  user: UserData; onClose: () => void;
  onSave: (data: Partial<UserData>) => Promise<void>;
  colors: any; isDark: boolean;
}) {
  const [form, setForm] = useState({
    name: user.name || "",
    phoneNumber: user.phoneNumber || "",
    country: user.country || "",
    isActive: user.isActive,
    planType: user.planType || "trial",
    role: user.role || "user",
  });
  const [extendDays, setExtendDays] = useState(30);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"details" | "plan">("details");

  const panelBg = isDark ? "#161616" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  const handleFreeForever = async () => {
    setSaving(true);
    await onSave({ planType: "free_forever", isFreeForever: true } as any);
    setSaving(false);
    onClose();
  };

  const handleExtendTrial = async () => {
    setSaving(true);
    const newEnd = new Date();
    newEnd.setDate(newEnd.getDate() + extendDays);
    await onSave({ trialEndDate: newEnd.toISOString(), planType: "trial" } as any);
    setSaving(false);
    onClose();
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", boxSizing: "border-box" as const,
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: panelBg, border: `1px solid ${panelBorder}`,
        borderRadius: "16px", width: "100%", maxWidth: "520px",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: `1px solid ${panelBorder}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", fontWeight: 700, color: "white",
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: isDark ? "#e5e5e5" : "#111" }}>{user.name}</p>
              <p style={{ fontSize: "12px", color: isDark ? "#737373" : "#6b7280" }}>{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: "30px", height: "30px", borderRadius: "8px",
            border: `1px solid ${panelBorder}`, background: "transparent",
            color: isDark ? "#737373" : "#6b7280", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${panelBorder}`, padding: "0 24px" }}>
          {(["details", "plan"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "12px 16px", fontSize: "13px", fontWeight: tab === t ? 600 : 400,
              color: tab === t ? "#a78bfa" : isDark ? "#737373" : "#6b7280",
              background: "none", border: "none", cursor: "pointer",
              borderBottom: `2px solid ${tab === t ? "#7c3aed" : "transparent"}`,
              marginBottom: "-1px", textTransform: "capitalize",
            }}>
              {t === "details" ? "User Details" : "Plan & Trial"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
          {tab === "details" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Full Name", key: "name", type: "text", icon: User },
                { label: "Phone Number", key: "phoneNumber", type: "tel", icon: Phone },
                { label: "Country", key: "country", type: "text", icon: Globe },
              ].map(({ label, key, type, icon: Icon }) => (
                <div key={key}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 500, color: isDark ? "#a3a3a3" : "#4b5563", marginBottom: "6px" }}>
                    <Icon size={12} /> {label}
                  </label>
                  <input
                    type={type}
                    value={(form as any)[key] || ""}
                    onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}

              {/* Role */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: isDark ? "#a3a3a3" : "#4b5563", marginBottom: "6px" }}>
                  Role
                </label>
                <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))} style={inputStyle}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Active status */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", borderRadius: "8px",
                background: colors.bg, border: `1px solid ${colors.border}`,
              }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text }}>Account Active</p>
                  <p style={{ fontSize: "11px", color: colors.textMuted }}>
                    {form.isActive ? "User can login and use the platform" : "User is deactivated"}
                  </p>
                </div>
                <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} style={{
                  width: "44px", height: "24px", borderRadius: "12px", border: "none",
                  cursor: "pointer", position: "relative",
                  background: form.isActive ? "#7c3aed" : colors.border,
                  transition: "background 0.2s",
                }}>
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "50%", background: "white",
                    position: "absolute", top: "3px",
                    left: form.isActive ? "23px" : "3px", transition: "left 0.2s",
                  }} />
                </button>
              </div>
            </div>
          )}

          {tab === "plan" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Current plan */}
              <div style={{
                padding: "14px", borderRadius: "10px",
                background: colors.bg, border: `1px solid ${colors.border}`,
              }}>
                <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "6px" }}>Current Plan</p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    fontSize: "13px", fontWeight: 600, padding: "4px 12px", borderRadius: "9999px",
                    background: PLAN_COLORS[user.planType]?.bg || "rgba(107,114,128,0.1)",
                    color: PLAN_COLORS[user.planType]?.color || "#6b7280",
                  }}>
                    {PLAN_LABELS[user.planType] || user.planType}
                  </span>
                  {user.trialEndDate && (
                    <span style={{ fontSize: "12px", color: colors.textMuted }}>
                      Expires: {new Date(user.trialEndDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Change plan */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "6px" }}>
                  Change Plan
                </label>
                <select value={form.planType} onChange={(e) => setForm(f => ({ ...f, planType: e.target.value }))} style={inputStyle}>
                  <option value="trial">Free Trial</option>
                  <option value="paid">Pro (Paid)</option>
                  <option value="free_forever">Free Forever</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Extend trial */}
              <div style={{ padding: "14px", borderRadius: "10px", background: colors.bg, border: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text, marginBottom: "10px" }}>Extend Trial</p>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="number" value={extendDays} min={1} max={365}
                    onChange={(e) => setExtendDays(parseInt(e.target.value))}
                    style={{ ...inputStyle, width: "80px" }}
                  />
                  <span style={{ fontSize: "12px", color: colors.textMuted }}>days</span>
                  <button onClick={handleExtendTrial} style={{
                    padding: "8px 14px", borderRadius: "7px", cursor: "pointer",
                    background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
                    color: "#a78bfa", fontSize: "12px", fontWeight: 600,
                  }}>
                    Extend
                  </button>
                </div>
              </div>

              {/* Free forever */}
              <button onClick={handleFreeForever} style={{
                padding: "12px", borderRadius: "9px", cursor: "pointer",
                background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
                color: "#3b82f6", fontSize: "13px", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}>
                <Shield size={14} /> Grant Free Forever Access
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${panelBorder}`, display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer",
            border: `1px solid ${panelBorder}`, background: "transparent",
            color: isDark ? "#a3a3a3" : "#4b5563", fontSize: "13px",
          }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 2, padding: "10px", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white",
            border: "none", fontSize: "13px", fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────
function DeleteConfirmModal({ user, onClose, onConfirm, isDark }: {
  user: UserData; onClose: () => void; onConfirm: () => void; isDark: boolean;
}) {
  const panelBg = isDark ? "#161616" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: panelBg, border: `1px solid ${panelBorder}`,
        borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "380px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
      }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "12px",
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
        }}>
          <AlertTriangle size={22} color="#ef4444" />
        </div>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: isDark ? "#e5e5e5" : "#111", textAlign: "center", marginBottom: "8px" }}>
          Deactivate User?
        </h2>
        <p style={{ fontSize: "13px", color: isDark ? "#737373" : "#6b7280", textAlign: "center", lineHeight: 1.6, marginBottom: "24px" }}>
          This will deactivate <strong>{user.name}</strong> and all their subscribed services. Their data is soft-deleted and can be restored.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer",
            border: `1px solid ${panelBorder}`, background: "transparent",
            color: isDark ? "#a3a3a3" : "#4b5563", fontSize: "13px",
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer",
            background: "#ef4444", color: "white", border: "none",
            fontSize: "13px", fontWeight: 600,
          }}>
            Deactivate
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Users Page ───────────────────────────────────────────
export function UsersPage() {
  const { colors, isDark } = useTheme();
  const { user: currentUser } = useAuthStore();
  const router = useRouter();

  // Redirect non-admins
  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.push("/dashboard");
    }
  }, [currentUser]);

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserData | null>(null);
  const limit = 10;

  useEffect(() => { fetchUsers(); }, [page, statusFilter, planFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(), limit: limit.toString(),
        ...(statusFilter !== "all" && { isActive: statusFilter }),
        ...(planFilter !== "all" && { planType: planFilter }),
        ...(search && { search }),
      });
      const res = await api.get(`/users?${params}`);
      setUsers(res.data?.users || res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch {}
    setLoading(false);
  };

  const handleSearch = () => { setPage(1); fetchUsers(); };

  const handleSave = async (userId: string, data: Partial<UserData>) => {
    try {
      await api.patch(`/users/${userId}`, data);
      fetchUsers();
    } catch {}
  };

  const handleDelete = async (userId: string) => {
    try {
      await api.delete(`/users/${userId}`);
      setDeleteUser(null);
      fetchUsers();
    } catch {}
  };

  const totalPages = Math.ceil(total / limit);

  const inputStyle = {
    padding: "8px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>Users</h1>
          <p style={{ fontSize: "14px", color: colors.textMuted }}>
            Manage all registered users — {total} total
          </p>
        </div>
        <button onClick={fetchUsers} style={{
          display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px",
          borderRadius: "8px", border: `1px solid ${colors.border}`,
          background: colors.bgCard, color: colors.textMuted, cursor: "pointer", fontSize: "13px",
        }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", gap: "10px", marginBottom: "16px",
        background: colors.bgCard, border: `1px solid ${colors.border}`,
        borderRadius: "10px", padding: "14px 16px",
        flexWrap: "wrap", alignItems: "center",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={13} color={colors.textMuted} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by name or email..."
            style={{ ...inputStyle, width: "100%", paddingLeft: "30px", boxSizing: "border-box" as const }}
          />
        </div>

        {/* Status filter */}
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, minWidth: "130px" }}>
          <option value="all">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        {/* Plan filter */}
        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, minWidth: "140px" }}>
          <option value="all">All Plans</option>
          <option value="trial">Free Trial</option>
          <option value="paid">Pro</option>
          <option value="free_forever">Free Forever</option>
          <option value="expired">Expired</option>
        </select>

        <button onClick={handleSearch} style={{
          padding: "8px 16px", borderRadius: "8px", cursor: "pointer",
          background: "#7c3aed", color: "white", border: "none",
          fontSize: "13px", fontWeight: 600,
        }}>
          Search
        </button>

        <span style={{ fontSize: "12px", color: colors.textMuted, marginLeft: "auto" }}>
          {total} users
        </span>
      </div>

      {/* Table */}
      <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
        {/* Column headers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.5fr 100px 120px 80px 90px 100px",
          gap: "10px", padding: "10px 20px",
          background: colors.bg, borderBottom: `1px solid ${colors.border}`,
        }}>
          {["User", "Email", "Role", "Plan", "Modules", "Billed", "Actions"].map((h) => (
            <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: colors.textMuted }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <Loader2 size={24} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <Users size={32} color={colors.textMuted} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: "14px", color: colors.textMuted }}>No users found</p>
          </div>
        ) : (
          users.map((u, i) => {
            const plan = PLAN_COLORS[u.planType] || { color: "#6b7280", bg: "rgba(107,114,128,0.1)" };
            return (
              <div key={u._id} style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.5fr 100px 120px 80px 90px 100px",
                gap: "10px", padding: "13px 20px", alignItems: "center",
                borderBottom: i < users.length - 1 ? `1px solid ${colors.border}` : "none",
                transition: "background 0.15s",
                opacity: u.isDeleted ? 0.5 : 1,
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = colors.bg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                {/* User */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 700, color: "white",
                  }}>
                    {u.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {u.name}
                    </p>
                    <p style={{ fontSize: "11px", color: colors.textMuted }}>
                      {u.provider || "email"} · {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <p style={{ fontSize: "12px", color: colors.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {u.email}
                </p>

                {/* Role */}
                <span style={{
                  fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px",
                  background: u.role === "admin" ? "rgba(124,58,237,0.1)" : "rgba(107,114,128,0.1)",
                  color: u.role === "admin" ? "#a78bfa" : "#6b7280",
                  display: "inline-block",
                }}>
                  {u.role}
                </span>

                {/* Plan */}
                <span style={{
                  fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "9999px",
                  background: plan.bg, color: plan.color, display: "inline-block",
                }}>
                  {PLAN_LABELS[u.planType] || u.planType || "Trial"}
                </span>

                {/* Modules */}
                <p style={{ fontSize: "12px", color: colors.textMuted, textAlign: "center" }}>
                  {(u.totalAgents || 0) + (u.totalAutomations || 0)}
                </p>

                {/* Billed */}
                <p style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 600 }}>
                  ${(u.totalBilled || 0).toFixed(2)}
                </p>

                {/* Actions */}
                <div style={{ display: "flex", gap: "5px" }}>
                  <button onClick={() => setSelectedUser(u)} title="View/Edit" style={{
                    width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer",
                    border: `1px solid ${colors.border}`, background: colors.bg,
                    color: colors.textMuted, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Eye size={12} />
                  </button>
                  <button onClick={() => setSelectedUser(u)} title="Edit" style={{
                    width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer",
                    border: "1px solid rgba(124,58,237,0.2)", background: "rgba(124,58,237,0.06)",
                    color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setDeleteUser(u)} title="Deactivate" style={{
                    width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer",
                    border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
                    color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px" }}>
          <p style={{ fontSize: "13px", color: colors.textMuted }}>
            Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div style={{ display: "flex", gap: "5px" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
              width: "32px", height: "32px", borderRadius: "7px",
              border: `1px solid ${colors.border}`, background: colors.bgCard,
              color: colors.text, cursor: page === 1 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: page === 1 ? 0.4 : 1,
            }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} style={{
                width: "32px", height: "32px", borderRadius: "7px", cursor: "pointer",
                border: `1px solid ${page === p ? "rgba(124,58,237,0.3)" : colors.border}`,
                background: page === p ? "rgba(124,58,237,0.1)" : colors.bgCard,
                color: page === p ? "#a78bfa" : colors.text,
                fontSize: "13px", fontWeight: page === p ? 600 : 400,
              }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
              width: "32px", height: "32px", borderRadius: "7px",
              border: `1px solid ${colors.border}`, background: colors.bgCard,
              color: colors.text, cursor: page === totalPages ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: page === totalPages ? 0.4 : 1,
            }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={(data) => handleSave(selectedUser._id, data)}
          colors={colors}
          isDark={isDark}
        />
      )}
      {deleteUser && (
        <DeleteConfirmModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={() => handleDelete(deleteUser._id)}
          isDark={isDark}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}