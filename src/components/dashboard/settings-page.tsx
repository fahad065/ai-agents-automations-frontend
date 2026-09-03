"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import dynamic from "next/dynamic";
import {
  Bell, Shield, Save,
  Loader2, AlertCircle, Lock, AlertTriangle,
  Mail, Bold, Italic, Underline, List, ListOrdered, Link, Eye, EyeOff, Send,
} from "lucide-react";
import { toast } from "sonner";

const ReactSelect = dynamic(() => import("react-select"), { ssr: false });

// ── Section ───────────────────────────────────────────────────
function Section({ title, icon: Icon, children, colors }: {
  title: string; icon: any; children: React.ReactNode; colors: any;
}) {
  return (
    <div style={{
      background: colors.bgCard, border: `1px solid ${colors.border}`,
      borderRadius: "12px", overflow: "hidden", marginBottom: "16px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "16px 20px", borderBottom: `1px solid ${colors.border}`,
      }}>
        <Icon size={15} color="#a78bfa" />
        <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>{title}</h2>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export function SettingsPage() {
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as "notifications" | "security" | "email" | null) || "notifications";

  const [tab, setTab] = useState<"notifications" | "security" | "email">(initialTab);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [notifs, setNotifs] = useState({
    notifyOnComplete: true, notifyOnFail: true,
    notifyTrialExpiry: true, notifyBilling: true, emailUpdates: false,
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "", newPassword: "", confirmPassword: "",
  });
  const [pwError, setPwError] = useState("");

  // react-select styles that match theme
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      background: colors.bg,
      borderColor: colors.border,
      borderRadius: "8px",
      fontSize: "13px",
      minHeight: "38px",
      boxShadow: "none",
      "&:hover": { borderColor: "#7c3aed" },
    }),
    menu: (base: any) => ({
      ...base,
      background: isDark ? "#1a1a1a" : "#ffffff",
      border: `1px solid ${colors.border}`,
      borderRadius: "8px",
      zIndex: 9999,
      position: "absolute",
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base: any, state: any) => ({
      ...base,
      background: state.isSelected
        ? "#7c3aed"
        : state.isFocused
        ? (isDark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)")
        : "transparent",
      color: state.isSelected ? "white" : colors.text,
      fontSize: "13px",
      cursor: "pointer",
    }),
    singleValue: (base: any) => ({ ...base, color: colors.text }),
    placeholder: (base: any) => ({ ...base, color: colors.textMuted, fontSize: "13px" }),
    input: (base: any) => ({ ...base, color: colors.text }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base: any) => ({ ...base, color: colors.textMuted }),
  };

  useEffect(() => { fetchNotifPrefs(); }, []);

  const fetchNotifPrefs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/profile");
      const u = res.data?.user || res.data;
      setNotifs({
        notifyOnComplete: u.notifyOnComplete ?? true,
        notifyOnFail: u.notifyOnFail ?? true,
        notifyTrialExpiry: u.notifyTrialExpiry ?? true,
        notifyBilling: u.notifyBilling ?? true,
        emailUpdates: u.emailUpdates ?? false,
      });
    } catch {}
    setLoading(false);
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      await api.patch("/users/profile", notifs);
      toast.success("Notification preferences saved")
    } catch {
      toast.error("Failed to save preferences");
    }
    setSaving(false);
  };

  const changePassword = async () => {
    setPwError("");
    if (passwords.newPassword !== passwords.confirmPassword) { setPwError("Passwords do not match"); return; }
    if (passwords.newPassword.length < 8) { setPwError("Minimum 8 characters"); return; }
    setSaving(true);
    try {
      await api.patch("/users/change-password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password")
    }
    setSaving(false);
  };

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit",
  };

  const lbl = (text: string) => (
    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>
      {text}
    </label>
  );

  const SaveBtn = ({ onClick }: { onClick: () => void }) => (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
      <button onClick={onClick} disabled={saving} style={{
        display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px",
        borderRadius: "8px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
        color: "white", border: "none", cursor: saving ? "not-allowed" : "pointer",
        fontSize: "13px", fontWeight: 600, opacity: saving ? 0.7 : 1,
        boxShadow: saving ? "none" : "0 4px 12px rgba(124,58,237,0.3)",
      }}>
        {saving
          ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
          : <Save size={14} />}
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} style={{
      width: "44px", height: "24px", borderRadius: "12px", border: "none",
      cursor: "pointer", position: "relative", flexShrink: 0,
      background: value ? "#7c3aed" : colors.border, transition: "background 0.2s",
    }}>
      <div style={{
        width: "18px", height: "18px", borderRadius: "50%", background: "white",
        position: "absolute", top: "3px",
        left: value ? "23px" : "3px", transition: "left 0.2s",
      }} />
    </button>
  );

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>Settings</h1>
        <p style={{ fontSize: "14px", color: colors.textMuted }}>Manage your profile, notifications and security.</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: "2px", marginBottom: "20px",
        background: colors.bgCard, border: `1px solid ${colors.border}`,
        borderRadius: "10px", padding: "4px", width: "fit-content",
      }}>
        {([
          { key: "notifications", label: "Notifications", icon: Bell,   adminOnly: false },
          { key: "security",      label: "Security",      icon: Shield, adminOnly: false },
          { key: "email",         label: "Email Sender",  icon: Mail,   adminOnly: true  },
        ] as const).filter(t => !t.adminOnly || (user as any)?.role === "admin").map(({ key, label: lbl2, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "7px 16px", borderRadius: "7px", fontSize: "13px",
            fontWeight: tab === key ? 600 : 400, cursor: "pointer", border: "none",
            background: tab === key ? (isDark ? "#1a1a1a" : "#ffffff") : "transparent",
            color: tab === key ? colors.text : colors.textMuted,
            boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
          }}>
            <Icon size={13} /> {lbl2}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: "60px", textAlign: "center" }}>
          <Loader2 size={22} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      ) : (
        <>
          {/* ── NOTIFICATIONS ── */}
          {tab === "notifications" && (
            <Section title="Notification Preferences" icon={Bell} colors={colors}>
              <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "18px" }}>
                Email notifications sent to <strong style={{ color: colors.text }}>{user?.email}</strong>
              </p>
              {[
                { key: "notifyOnComplete", label: "Pipeline Completed",  desc: "When a video or content is successfully uploaded" },
                { key: "notifyOnFail",     label: "Pipeline Failed",     desc: "When a pipeline run encounters an error" },
                { key: "notifyTrialExpiry",label: "Trial Expiry",        desc: "3 days before your free trial expires" },
                { key: "notifyBilling",    label: "Billing Updates",     desc: "Invoices, payment confirmations, subscription changes" },
                { key: "emailUpdates",     label: "Product Updates",     desc: "Occasional emails about new features" },
              ].map(({ key, label: lbl2, desc }) => (
                <div key={key} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", background: colors.bg,
                  border: `1px solid ${colors.border}`, borderRadius: "9px", marginBottom: "10px",
                }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text }}>{lbl2}</p>
                    <p style={{ fontSize: "11px", color: colors.textMuted }}>{desc}</p>
                  </div>
                  <Toggle
                    value={(notifs as any)[key]}
                    onChange={() => setNotifs(n => ({ ...n, [key]: !(n as any)[key] }))}
                  />
                </div>
              ))}
              <SaveBtn onClick={saveNotifications} />
            </Section>
          )}

          {/* ── SECURITY ── */}
          {tab === "security" && (
            <>
              <Section title="Change Password" icon={Lock} colors={colors}>
                {(user as any)?.provider && (user as any).provider !== "local" ? (
                  <div style={{ padding: "14px", background: colors.bg, borderRadius: "8px", border: `1px solid ${colors.border}` }}>
                    <p style={{ fontSize: "13px", color: colors.textMuted }}>
                      You signed in with {(user as any).provider}. Password is managed by your provider.
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px", maxWidth: "420px" }}>
                      {[
                        { key: "oldPassword", label: "Current Password", placeholder: "••••••••" },
                        { key: "newPassword", label: "New Password", placeholder: "Min. 8 characters" },
                        { key: "confirmPassword", label: "Confirm New Password", placeholder: "Repeat password" },
                      ].map(({ key, label: lbl2, placeholder }) => (
                        <div key={key}>
                          {lbl(lbl2)}
                          <input type="password" value={(passwords as any)[key]}
                            onChange={(e) => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                            style={inp} placeholder={placeholder} />
                        </div>
                      ))}
                    </div>
                    {pwError && (
                      <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
                        <AlertCircle size={12} /> {pwError}
                      </p>
                    )}
                    <SaveBtn onClick={changePassword} />
                  </>
                )}
              </Section>

              <Section title="Danger Zone" icon={AlertTriangle} colors={colors}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", background: "rgba(239,68,68,0.04)",
                  border: "1px solid rgba(239,68,68,0.15)", borderRadius: "9px",
                  flexWrap: "wrap", gap: "12px",
                }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text }}>Deactivate Account</p>
                    <p style={{ fontSize: "11px", color: colors.textMuted }}>
                      Disables your account and cancels all active subscriptions.
                    </p>
                  </div>
                  <button onClick={() => {
                    if (confirm("Are you sure? This will deactivate your account.")) {
                      api.delete("/users/deactivate").then(() => { window.location.href = "/auth/login"; });
                    }
                  }} style={{
                    padding: "8px 16px", borderRadius: "7px", cursor: "pointer",
                    border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)",
                    color: "#ef4444", fontSize: "12px", fontWeight: 600,
                  }}>
                    Deactivate Account
                  </button>
                </div>
              </Section>
            </>
          )}
        </>
      )}

      {tab === "email" && (user as any)?.role === "admin" && (
        <EmailSenderTab colors={colors} isDark={isDark} selectStyles={selectStyles} />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .lm-editor:focus { outline: none; }
        .lm-editor a { color: #a78bfa; }
        .lm-editor ul { padding-left: 20px; }
        .lm-editor ol { padding-left: 20px; }
        .lm-toolbar-btn:hover { background: rgba(124,58,237,0.12) !important; }
      `}</style>
    </div>
  );
}

// ── Email Sender Tab ──────────────────────────────────────────
function EmailSenderTab({ colors, isDark, selectStyles }: { colors: any; isDark: boolean; selectStyles: any }) {
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [to, setTo] = useState<{ value: string; label: string }[]>([]);
  const [subject, setSubject] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/admin/users").then((res: any) => {
      const list = (res.data || []).map((u: any) => ({
        value: u.email,
        label: `${u.name || "Unknown"} — ${u.email}`,
      }));
      setUsers(list);
    }).catch(() => {}).finally(() => setLoadingUsers(false));
  }, []);

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) execCmd("createLink", url);
  };

  const getHtml = () => editorRef.current?.innerHTML || "";

  const send = async () => {
    if (!to.length) { toast.error("Select at least one recipient"); return; }
    if (!subject.trim()) { toast.error("Subject is required"); return; }
    const html = getHtml();
    if (!html.trim() || html === "<br>") { toast.error("Email body is empty"); return; }
    setSending(true);
    setResult(null);
    try {
      const res = await api.post("/admin/email/send", {
        to: to.map(t => t.value),
        subject,
        html,
      });
      setResult(res.data);
      if (res.data.failed === 0) {
        toast.success(`Sent to ${res.data.sent} recipient${res.data.sent > 1 ? "s" : ""}`);
        setTo([]);
        setSubject("");
        if (editorRef.current) editorRef.current.innerHTML = "";
      } else {
        toast.warning(`${res.data.sent} sent, ${res.data.failed} failed`);
      }
    } catch {
      toast.error("Failed to send email");
    }
    setSending(false);
  };

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit",
  };

  const toolbarBtnStyle = (active = false): React.CSSProperties => ({
    width: "30px", height: "30px", borderRadius: "6px", border: "none",
    background: active ? "rgba(124,58,237,0.18)" : "transparent",
    color: active ? "#a78bfa" : colors.textMuted,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "13px", flexShrink: 0,
  });

  const multiSelectStyles = {
    ...selectStyles,
    multiValue: (base: any) => ({ ...base, background: "rgba(124,58,237,0.15)", borderRadius: "5px" }),
    multiValueLabel: (base: any) => ({ ...base, color: "#a78bfa", fontSize: "11px" }),
    multiValueRemove: (base: any) => ({ ...base, color: "#a78bfa", ":hover": { background: "rgba(124,58,237,0.3)", color: "white" } }),
  };

  return (
    <div>
      {/* Header card */}
      <div style={{
        background: colors.bgCard, border: `1px solid ${colors.border}`,
        borderRadius: "12px", overflow: "hidden", marginBottom: "16px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: `1px solid ${colors.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Mail size={15} color="#a78bfa" />
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>Email Sender</h2>
          </div>
          <span style={{
            fontSize: "11px", padding: "3px 8px", borderRadius: "5px",
            background: "rgba(124,58,237,0.12)", color: "#a78bfa", fontWeight: 600,
          }}>
            Admin only · via hello@logicmate.io
          </span>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* To field */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>
              To
            </label>
            {loadingUsers ? (
              <div style={{ padding: "10px", fontSize: "13px", color: colors.textMuted }}>
                <Loader2 size={13} style={{ animation: "spin 1s linear infinite", display: "inline", marginRight: "6px" }} />
                Loading users...
              </div>
            ) : (
              <ReactSelect
                isMulti
                options={users}
                value={to}
                onChange={(v: any) => setTo(v || [])}
                styles={multiSelectStyles}
                placeholder="Search and select recipients..."
                isSearchable
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPosition="fixed"
                closeMenuOnSelect={false}
              />
            )}
            {to.length > 0 && (
              <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "5px" }}>
                {to.length} recipient{to.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>
              Subject
            </label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              style={inp}
              placeholder="Email subject..."
            />
          </div>

          {/* Body editor */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: colors.textMuted }}>
                Message
              </label>
              <button onClick={() => setShowPreview(v => !v)} style={{
                display: "flex", alignItems: "center", gap: "5px",
                fontSize: "11px", color: colors.textMuted, background: "transparent",
                border: "none", cursor: "pointer", padding: "2px 6px",
              }}>
                {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPreview ? "Edit" : "Preview"}
              </button>
            </div>

            {!showPreview ? (
              <div style={{
                border: `1px solid ${colors.border}`, borderRadius: "8px", overflow: "hidden",
              }}>
                {/* Toolbar */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "2px",
                  padding: "6px 8px", borderBottom: `1px solid ${colors.border}`,
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                  flexWrap: "wrap",
                }}>
                  {[
                    { icon: <Bold size={13} />, cmd: "bold", title: "Bold" },
                    { icon: <Italic size={13} />, cmd: "italic", title: "Italic" },
                    { icon: <Underline size={13} />, cmd: "underline", title: "Underline" },
                  ].map(({ icon, cmd, title }) => (
                    <button key={cmd} className="lm-toolbar-btn" onMouseDown={e => { e.preventDefault(); execCmd(cmd); }}
                      style={toolbarBtnStyle()} title={title}>
                      {icon}
                    </button>
                  ))}
                  <div style={{ width: "1px", height: "18px", background: colors.border, margin: "0 4px" }} />
                  <button className="lm-toolbar-btn" onMouseDown={e => { e.preventDefault(); execCmd("insertUnorderedList"); }}
                    style={toolbarBtnStyle()} title="Bullet list">
                    <List size={13} />
                  </button>
                  <button className="lm-toolbar-btn" onMouseDown={e => { e.preventDefault(); execCmd("insertOrderedList"); }}
                    style={toolbarBtnStyle()} title="Numbered list">
                    <ListOrdered size={13} />
                  </button>
                  <div style={{ width: "1px", height: "18px", background: colors.border, margin: "0 4px" }} />
                  <button className="lm-toolbar-btn" onMouseDown={e => { e.preventDefault(); insertLink(); }}
                    style={toolbarBtnStyle()} title="Insert link">
                    <Link size={13} />
                  </button>
                  <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
                    {[
                      { label: "H1", cmd: "formatBlock", val: "H1" },
                      { label: "H2", cmd: "formatBlock", val: "H2" },
                      { label: "P",  cmd: "formatBlock", val: "P" },
                    ].map(({ label, cmd, val }) => (
                      <button key={label} className="lm-toolbar-btn" onMouseDown={e => { e.preventDefault(); execCmd(cmd, val); }}
                        style={{ ...toolbarBtnStyle(), width: "auto", padding: "0 8px", fontSize: "11px", fontWeight: 600 }}
                        title={`${label} heading`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editable area */}
                <div
                  ref={editorRef}
                  className="lm-editor"
                  contentEditable
                  suppressContentEditableWarning
                  style={{
                    minHeight: "240px", padding: "14px 16px",
                    fontSize: "14px", lineHeight: "1.7",
                    color: colors.text, background: colors.bg,
                    outline: "none",
                  }}
                  onKeyDown={e => {
                    if (e.key === "Tab") { e.preventDefault(); execCmd("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;"); }
                  }}
                />
              </div>
            ) : (
              <div style={{
                border: `1px solid ${colors.border}`, borderRadius: "8px",
                padding: "16px", minHeight: "260px", background: colors.bg,
                fontSize: "14px", lineHeight: "1.7", color: colors.text,
              }}
                dangerouslySetInnerHTML={{ __html: getHtml() }}
              />
            )}
          </div>

          {/* Result banner */}
          {result && (
            <div style={{
              padding: "12px 14px", borderRadius: "8px", fontSize: "13px",
              background: result.failed === 0 ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)",
              border: `1px solid ${result.failed === 0 ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
              color: result.failed === 0 ? "#22c55e" : "#f59e0b",
            }}>
              {result.failed === 0
                ? `✓ Email sent to ${result.sent} recipient${result.sent > 1 ? "s" : ""}`
                : `${result.sent} sent · ${result.failed} failed`}
            </div>
          )}

          {/* Send button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={send} disabled={sending} style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px",
              borderRadius: "8px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "white", border: "none", cursor: sending ? "not-allowed" : "pointer",
              fontSize: "13px", fontWeight: 600, opacity: sending ? 0.7 : 1,
              boxShadow: sending ? "none" : "0 4px 12px rgba(124,58,237,0.3)",
            }}>
              {sending
                ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                : <Send size={14} />}
              {sending ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}