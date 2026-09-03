"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import dynamic from "next/dynamic";
import {
  Bell, Shield, Save,
  Loader2, AlertCircle, AlertTriangle,
  Mail, Bold, Italic, Underline, List, ListOrdered, Link, Eye, EyeOff, Send,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ReactSelect = dynamic(() => import("react-select"), { ssr: false });

const TABS = [
  { key: "notifications", label: "Notifications", icon: Bell, adminOnly: false },
  { key: "security", label: "Security", icon: Shield, adminOnly: false },
  { key: "email", label: "Email Sender", icon: Mail, adminOnly: true },
] as const;

// ── Main ──────────────────────────────────────────────────────
export function SettingsPage() {
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as "notifications" | "security" | "email" | null) || "notifications";
  const isAdmin = (user as any)?.role === "admin";

  const [tab, setTab] = useState<"notifications" | "security" | "email">(initialTab);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

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

  const deactivateAccount = async () => {
    setDeactivating(true);
    try {
      await api.delete("/users/deactivate");
      window.location.href = "/auth/login";
    } catch {
      toast.error("Failed to deactivate account");
      setDeactivating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your notifications, security and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[220px_1fr]">
        {/* Left vertical nav */}
        <nav className="flex flex-row gap-1 overflow-x-auto rounded-xl border bg-card p-2 md:flex-col md:overflow-visible">
          {TABS.filter((t) => !t.adminOnly || isAdmin).map(({ key, label: navLabel, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                tab === key
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {navLabel}
            </button>
          ))}
        </nav>

        {/* Right content */}
        {loading ? (
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : tab === "email" ? (
          isAdmin && <EmailSenderTab colors={colors} isDark={isDark} selectStyles={selectStyles} />
        ) : (
          <div className="rounded-xl border bg-card p-6">
            {/* ── NOTIFICATIONS ── */}
            {tab === "notifications" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Notification Preferences</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Email notifications sent to <strong className="text-foreground">{user?.email}</strong>
                  </p>
                </div>

                <div className="flex flex-col divide-y divide-border rounded-lg border">
                  {[
                    { key: "notifyOnComplete", label: "Pipeline Completed", desc: "When a video or content is successfully uploaded" },
                    { key: "notifyOnFail", label: "Pipeline Failed", desc: "When a pipeline run encounters an error" },
                    { key: "notifyTrialExpiry", label: "Trial Expiry", desc: "3 days before your free trial expires" },
                    { key: "notifyBilling", label: "Billing Updates", desc: "Invoices, payment confirmations, subscription changes" },
                    { key: "emailUpdates", label: "Product Updates", desc: "Occasional emails about new features" },
                  ].map(({ key, label: rowLabel, desc }) => (
                    <div key={key} className="flex items-center justify-between gap-4 px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-foreground">{rowLabel}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={(notifs as any)[key]}
                        onCheckedChange={() => setNotifs((n) => ({ ...n, [key]: !(n as any)[key] }))}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveNotifications} disabled={saving} className="gap-1.5">
                    {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </div>
            )}

            {/* ── SECURITY ── */}
            {tab === "security" && (
              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Change Password</h2>
                  {(user as any)?.provider && (user as any).provider !== "local" ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      You signed in with {(user as any).provider}. Password is managed by your provider.
                    </p>
                  ) : (
                    <div className="mt-4 flex max-w-sm flex-col gap-4">
                      {[
                        { key: "oldPassword", fieldLabel: "Current Password", placeholder: "••••••••" },
                        { key: "newPassword", fieldLabel: "New Password", placeholder: "Min. 8 characters" },
                        { key: "confirmPassword", fieldLabel: "Confirm New Password", placeholder: "Repeat password" },
                      ].map(({ key, fieldLabel, placeholder }) => (
                        <div key={key} className="flex flex-col gap-2">
                          <Label htmlFor={key}>{fieldLabel}</Label>
                          <Input
                            id={key}
                            type="password"
                            value={(passwords as any)[key]}
                            onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                            placeholder={placeholder}
                          />
                        </div>
                      ))}
                      {pwError && (
                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                          <AlertCircle className="size-3" /> {pwError}
                        </p>
                      )}
                      <div>
                        <Button onClick={changePassword} disabled={saving} className="gap-1.5">
                          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                          {saving ? "Saving…" : "Save changes"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h2 className="flex items-center gap-1.5 text-base font-semibold text-destructive">
                    <AlertTriangle className="size-4" /> Danger Zone
                  </h2>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/25 bg-destructive/[0.04] px-4 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">Deactivate Account</p>
                      <p className="text-xs text-muted-foreground">
                        Disables your account and cancels all active subscriptions.
                      </p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => setShowDeactivateConfirm(true)}>
                      Deactivate Account
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={showDeactivateConfirm} onOpenChange={setShowDeactivateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This disables your account and cancels all active subscriptions. You&apos;ll be signed out immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deactivateAccount}
              disabled={deactivating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deactivating ? "Deactivating…" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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