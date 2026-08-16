"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import {
  Search, UserX, UserCheck, Trash2,
  Shield, ChevronLeft, ChevronRight,
  Loader2, Eye, MoreHorizontal, RefreshCw,
  Clock, Gift, Pause, Play,
} from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  provider: string;
  agentCount: number;
  videoCount: number;
  createdAt: string;
  plan?: string;
  planType?: string;
  isFreeForever?: boolean;
  trialEndDate?: string;
}

interface UsersResponse {
  users: UserRow[];
  total: number;
  page: number;
  totalPages: number;
}

// ── Trial Actions Modal ───────────────────────────────────────
function TrialActionsModal({ user, onClose, onSuccess, colors }: {
  user: UserRow; onClose: () => void; onSuccess: () => void; colors: any;
}) {
  const [loading, setLoading] = useState(false);
  const [extendDays, setExtendDays] = useState(7);

  const trialEnd = user.trialEndDate ? new Date(user.trialEndDate) : null;
  const daysLeft = trialEnd
    ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const grantFree = async () => {
    if (!confirm(`Grant ${user.name} FREE FOREVER access?`)) return;
    setLoading(true);
    try {
      await api.patch(`/users/${user._id}/grant-free`, {});
      toast.success(`✅ ${user.name} granted free forever!`);
      onSuccess();
      onClose();
    } catch { toast.error("Failed to grant free forever"); }
    setLoading(false);
  };

  const extendTrial = async () => {
    setLoading(true);
    try {
      await api.patch(`/users/${user._id}/extend-trial`, { days: extendDays });
      toast.success(`✅ Trial extended by ${extendDays} days`);
      onSuccess();
      onClose();
    } catch { toast.error("Failed to extend trial"); }
    setLoading(false);
  };

  const pauseModules = async (pause: boolean) => {
    if (!confirm(`${pause ? "Pause" : "Unpause"} all modules for ${user.name}?`)) return;
    setLoading(true);
    try {
      await api.patch(`/users/${user._id}/pause-modules`, { pause });
      toast.success(`✅ Modules ${pause ? "paused" : "unpaused"}`);
      onSuccess();
      onClose();
    } catch { toast.error("Failed"); }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }} onClick={onClose}>
      <div style={{
        background: colors.bgCard, border: `1px solid ${colors.border}`,
        borderRadius: "16px", padding: "24px",
        width: "100%", maxWidth: "400px",
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>
            Trial & Access — {user.name}
          </h3>
          <p style={{ fontSize: "12px", color: colors.textMuted }}>{user.email}</p>
        </div>

        {/* Current status */}
        <div style={{
          background: colors.bg, border: `1px solid ${colors.border}`,
          borderRadius: "10px", padding: "14px", marginBottom: "20px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: colors.textMuted }}>Plan</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: colors.text }}>
              {user.isFreeForever ? "🎉 Free Forever" : user.planType || user.plan || "trial"}
            </span>
          </div>
          {daysLeft !== null && !user.isFreeForever && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: colors.textMuted }}>Trial status</span>
              <span style={{
                fontSize: "12px", fontWeight: 600,
                color: daysLeft <= 0 ? "#ef4444" : daysLeft <= 3 ? "#f59e0b" : "#22c55e",
              }}>
                {daysLeft <= 0 ? "Expired" : `${daysLeft} days left`}
              </span>
            </div>
          )}
          {trialEnd && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
              <span style={{ fontSize: "12px", color: colors.textMuted }}>Trial end date</span>
              <span style={{ fontSize: "12px", color: colors.textMuted }}>
                {trialEnd.toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

          {/* Extend trial */}
          {!user.isFreeForever && (
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                value={extendDays}
                onChange={e => setExtendDays(Number(e.target.value))}
                style={{
                  flex: 1, padding: "9px 12px", borderRadius: "8px",
                  fontSize: "13px", border: `1px solid ${colors.border}`,
                  background: colors.bg, color: colors.text, outline: "none",
                }}
              >
                {[3, 7, 14, 30, 60, 90].map(d => (
                  <option key={d} value={d}>Extend {d} days</option>
                ))}
              </select>
              <button onClick={extendTrial} disabled={loading} style={{
                padding: "9px 16px", borderRadius: "8px", fontSize: "13px",
                fontWeight: 600, background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                <Clock size={13} />
                Extend
              </button>
            </div>
          )}

          {/* Grant free forever */}
          {!user.isFreeForever && (
            <button onClick={grantFree} disabled={loading} style={{
              padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
              background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
              color: "#22c55e", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}>
              <Gift size={13} />
              Grant Free Forever
            </button>
          )}

          {/* Pause/Unpause */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => pauseModules(true)} disabled={loading} style={{
              flex: 1, padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
              background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
              color: "#f59e0b", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}>
              <Pause size={13} /> Pause All
            </button>
            <button onClick={() => pauseModules(false)} disabled={loading} style={{
              flex: 1, padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
              background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
              color: "#22c55e", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}>
              <Play size={13} /> Unpause All
            </button>
          </div>

          <button onClick={onClose} style={{
            padding: "10px", borderRadius: "8px", fontSize: "13px",
            background: "transparent", border: `1px solid ${colors.border}`,
            color: colors.textMuted, cursor: "pointer",
          }}>
            Close
          </button>
        </div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
            <Loader2 size={16} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export function AdminUsers() {
  const { colors } = useTheme();
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [trialModal, setTrialModal] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({ role: "", isActive: true, plan: "" });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: "15",
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await api.get(`/users?${params}`);
      setData(res.data);
    } catch {}
    setLoading(false);
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (userId: string, action: "suspend" | "activate" | "delete") => {
    if (action === "delete" && !confirm("Delete this user?")) return;
    setActionLoading(userId + action);
    try {
      if (action === "suspend") {
        await api.patch(`/users/${userId}`, { isActive: false });
        toast.success("User suspended");
      } else if (action === "activate") {
        await api.patch(`/users/${userId}`, { isActive: true });
        toast.success("User activated");
      } else if (action === "delete") {
        await api.delete(`/users/${userId}`);
        toast.success("User deleted");
      }
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action failed");
    }
    setActionLoading(null);
  };

  const openEdit = (user: UserRow) => {
    setSelectedUser(user);
    setEditForm({ role: user.role, isActive: user.isActive, plan: user.planType || user.plan || "trial" });
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (!selectedUser) return;
    setActionLoading(selectedUser._id + "edit");
    try {
      await api.patch(`/users/${selectedUser._id}`, editForm);
      toast.success("User updated");
      setEditModal(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update");
    }
    setActionLoading(null);
  };

  // Days left helper
  const getDaysLeft = (user: UserRow) => {
    if (user.isFreeForever) return null;
    if (!user.trialEndDate) return null;
    return Math.ceil((new Date(user.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const inputStyle = {
    padding: "8px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none",
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>Users</h1>
        <p style={{ fontSize: "14px", color: colors.textMuted }}>{data?.total ?? 0} total users</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={14} color={colors.textMuted} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ ...inputStyle, paddingLeft: "32px", width: "100%", boxSizing: "border-box" as const }}
          />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} style={inputStyle}>
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={inputStyle}>
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <button onClick={fetchUsers} style={{ ...inputStyle, display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 100px 80px 140px",
          padding: "12px 16px", borderBottom: `1px solid ${colors.border}`,
          background: colors.bgSecondary || colors.bg,
        }}>
          {["User", "Role / Status", "Plan / Trial", "Joined", "Actions"].map(h => (
            <p key={h} style={{ fontSize: "11px", fontWeight: 600, color: colors.textMuted }}>{h}</p>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <Loader2 size={24} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : data?.users.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ color: colors.textMuted, fontSize: "14px" }}>No users found</p>
          </div>
        ) : (
          data?.users.map((user, i) => {
            const daysLeft = getDaysLeft(user);
            return (
              <div key={user._id} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 100px 80px 140px",
                padding: "14px 16px", alignItems: "center",
                borderBottom: i < (data.users.length - 1) ? `1px solid ${colors.border}` : "none",
              }}>
                {/* User info */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "34px", height: "34px", borderRadius: "50%",
                    background: "rgba(124,58,237,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 700, color: "#a78bfa", flexShrink: 0,
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.name}
                    </p>
                    <p style={{ fontSize: "11px", color: colors.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Role / Status */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{
                    fontSize: "11px", fontWeight: 600, padding: "2px 8px",
                    borderRadius: "9999px", display: "inline-block", width: "fit-content",
                    background: user.role === "admin" ? "rgba(124,58,237,0.1)" : "rgba(107,114,128,0.1)",
                    color: user.role === "admin" ? "#a78bfa" : colors.textMuted,
                  }}>
                    {user.role}
                  </span>
                  <span style={{
                    fontSize: "11px", fontWeight: 600, padding: "2px 8px",
                    borderRadius: "9999px", display: "inline-block", width: "fit-content",
                    background: user.isActive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    color: user.isActive ? "#22c55e" : "#ef4444",
                  }}>
                    {user.isActive ? "Active" : "Suspended"}
                  </span>
                </div>

                {/* Plan / Trial */}
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span style={{
                    fontSize: "11px", fontWeight: 600, padding: "2px 8px",
                    borderRadius: "9999px", display: "inline-block", width: "fit-content",
                    background: user.isFreeForever ? "rgba(34,197,94,0.1)" : "rgba(124,58,237,0.08)",
                    color: user.isFreeForever ? "#22c55e" : "#a78bfa",
                  }}>
                    {user.isFreeForever ? "🎉 Free" : user.planType || "trial"}
                  </span>
                  {daysLeft !== null && !user.isFreeForever && (
                    <span style={{
                      fontSize: "10px", color: daysLeft <= 0 ? "#ef4444" : daysLeft <= 3 ? "#f59e0b" : colors.textMuted,
                      fontWeight: daysLeft <= 3 ? 600 : 400,
                    }}>
                      {daysLeft <= 0 ? "Expired" : `${daysLeft}d left`}
                    </span>
                  )}
                </div>

                {/* Joined */}
                <p style={{ fontSize: "11px", color: colors.textMuted }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div style={{ display: "flex", gap: "4px" }}>
                  <button onClick={() => openEdit(user)} title="Edit user" style={{
                    width: "28px", height: "28px", borderRadius: "6px",
                    border: `1px solid ${colors.border}`, background: colors.bg,
                    color: colors.textMuted, display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer",
                  }}>
                    <MoreHorizontal size={12} />
                  </button>
                  <button onClick={() => setTrialModal(user)} title="Trial & access" style={{
                    width: "28px", height: "28px", borderRadius: "6px",
                    border: "1px solid rgba(124,58,237,0.3)",
                    background: "rgba(124,58,237,0.08)",
                    color: "#a78bfa", display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer",
                  }}>
                    <Shield size={12} />
                  </button>
                  <button
                    onClick={() => handleAction(user._id, user.isActive ? "suspend" : "activate")}
                    title={user.isActive ? "Suspend" : "Activate"}
                    disabled={!!actionLoading}
                    style={{
                      width: "28px", height: "28px", borderRadius: "6px",
                      border: `1px solid ${user.isActive ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)"}`,
                      background: user.isActive ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.08)",
                      color: user.isActive ? "#f59e0b" : "#22c55e",
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    }}
                  >
                    {user.isActive ? <UserX size={12} /> : <UserCheck size={12} />}
                  </button>
                  <button onClick={() => handleAction(user._id, "delete")} title="Delete" disabled={!!actionLoading} style={{
                    width: "28px", height: "28px", borderRadius: "6px",
                    border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
                    color: "#ef4444", display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer",
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
      {data && data.totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" }}>
          <p style={{ fontSize: "13px", color: colors.textMuted }}>
            Page {data.page} of {data.totalPages} · {data.total} users
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
              ...inputStyle, display: "flex", alignItems: "center", gap: "4px",
              cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1,
            }}>
              <ChevronLeft size={14} /> Prev
            </button>
            <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} style={{
              ...inputStyle, display: "flex", alignItems: "center", gap: "4px",
              cursor: page === data.totalPages ? "not-allowed" : "pointer", opacity: page === data.totalPages ? 0.4 : 1,
            }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && selectedUser && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        }}>
          <div style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "400px",
          }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: colors.text, marginBottom: "20px" }}>
              Edit user — {selectedUser.name}
            </h2>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "6px" }}>Role</label>
              <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" as const }}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "6px" }}>Plan</label>
              <select value={editForm.plan} onChange={e => setEditForm(f => ({ ...f, plan: e.target.value }))}
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" as const }}>
                <option value="trial">Trial</option>
                <option value="lifetime">Lifetime</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "6px" }}>Status</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[{ label: "Active", value: true }, { label: "Suspended", value: false }].map(opt => (
                  <button key={String(opt.value)} onClick={() => setEditForm(f => ({ ...f, isActive: opt.value }))} style={{
                    flex: 1, padding: "8px", borderRadius: "8px", fontSize: "13px", cursor: "pointer",
                    border: `1px solid ${editForm.isActive === opt.value ? "rgba(124,58,237,0.4)" : colors.border}`,
                    background: editForm.isActive === opt.value ? "rgba(124,58,237,0.1)" : "transparent",
                    color: editForm.isActive === opt.value ? "#a78bfa" : colors.textMuted,
                  }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={saveEdit} disabled={!!actionLoading} style={{
                flex: 1, padding: "10px", borderRadius: "8px",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "white", border: "none", cursor: "pointer",
                fontSize: "14px", fontWeight: 600,
              }}>
                Save changes
              </button>
              <button onClick={() => setEditModal(false)} style={{
                padding: "10px 16px", borderRadius: "8px",
                border: `1px solid ${colors.border}`,
                background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "14px",
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trial Actions Modal */}
      {trialModal && (
        <TrialActionsModal
          user={trialModal}
          onClose={() => setTrialModal(null)}
          onSuccess={fetchUsers}
          colors={colors}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}