"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import dynamic from "next/dynamic";
import {
  User, Bell, Shield, Moon, Sun, Save,
  Loader2, CheckCircle2, AlertCircle, Lock, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const ReactSelect = dynamic(() => import("react-select"), { ssr: false });

const TIMEZONES = [
  { value: "Pacific/Honolulu", label: "Pacific/Honolulu (UTC-10)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (UTC-8)" },
  { value: "America/Denver", label: "America/Denver (UTC-7)" },
  { value: "America/Chicago", label: "America/Chicago (UTC-6)" },
  { value: "America/New_York", label: "America/New_York (UTC-5)" },
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (UTC-3)" },
  { value: "Europe/London", label: "Europe/London (UTC+0)" },
  { value: "Europe/Paris", label: "Europe/Paris (UTC+1)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (UTC+1)" },
  { value: "Europe/Moscow", label: "Europe/Moscow (UTC+3)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (UTC+4)" },
  { value: "Asia/Karachi", label: "Asia/Karachi (UTC+5)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (UTC+5:30)" },
  { value: "Asia/Dhaka", label: "Asia/Dhaka (UTC+6)" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (UTC+7)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (UTC+8)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (UTC+8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (UTC+9)" },
  { value: "Asia/Seoul", label: "Asia/Seoul (UTC+9)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (UTC+10)" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (UTC+12)" },
];

// ── Country list ──────────────────────────────────────────────
const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium","Bolivia","Bosnia",
  "Brazil","Bulgaria","Cambodia","Canada","Chile","China","Colombia","Croatia","Cuba",
  "Cyprus","Czech Republic","Denmark","Ecuador","Egypt","Estonia","Ethiopia","Finland",
  "France","Georgia","Germany","Ghana","Greece","Guatemala","Honduras","Hungary",
  "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica",
  "Japan","Jordan","Kazakhstan","Kenya","Kuwait","Latvia","Lebanon","Libya","Lithuania",
  "Luxembourg","Malaysia","Maldives","Malta","Mexico","Moldova","Monaco","Mongolia",
  "Montenegro","Morocco","Myanmar","Nepal","Netherlands","New Zealand","Nigeria","Norway",
  "Oman","Pakistan","Palestine","Panama","Paraguay","Peru","Philippines","Poland",
  "Portugal","Qatar","Romania","Russia","Saudi Arabia","Senegal","Serbia","Singapore",
  "Slovakia","Slovenia","Somalia","South Africa","South Korea","Spain","Sri Lanka",
  "Sudan","Sweden","Switzerland","Syria","Taiwan","Tanzania","Thailand","Tunisia",
  "Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States",
  "Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
].map(c => ({ value: c, label: c }));

const NICHES = [
  "Dark Psychology & Human Behavior", "Finance & Investing", "Health & Fitness",
  "Business & Entrepreneurship", "Technology & AI", "Self Improvement",
  "True Crime", "History", "Science & Nature", "Travel & Lifestyle",
  "Food & Cooking", "Gaming", "Music", "Sports", "Comedy", "Other",
].map(n => ({ value: n, label: n }));

const ROLES = [
  "Solo Creator", "Agency Owner", "Business Owner", "Freelancer", "Enterprise", "Other",
].map(r => ({ value: r, label: r }));

const GOALS = [
  "Grow YouTube channel", "Generate leads", "Build brand",
  "Passive income", "Client work", "Other",
].map(g => ({ value: g, label: g }));

const EXPERIENCE = [
  "Beginner", "Intermediate", "Advanced", "Expert",
].map(e => ({ value: e, label: e }));

const HEARD_ABOUT = [
  "Google Search", "YouTube", "Instagram", "Twitter/X",
  "Friend / Referral", "Reddit", "Other",
].map(s => ({ value: s, label: s }));

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
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuthStore();

  const [tab, setTab] = useState<"profile" | "notifications" | "security">("profile");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: "", email: "", phoneNumber: "", country: "",
    timezone: "", company: "", niche: "", role: "",
    primaryGoal: "", experienceLevel: "", heardAboutUs: "",
  });

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

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/profile");
      const u = res.data?.user || res.data;
      setProfile({
        name: u.name || "",
        email: u.email || "",
        phoneNumber: u.phoneNumber || "",
        country: u.country || "",
        timezone: u.timezone || "",
        company: u.company || "",
        niche: u.onboarding?.contentNiche || "",
        role: u.onboarding?.role || "",
        primaryGoal: u.onboarding?.primaryGoal || "",
        experienceLevel: u.onboarding?.experienceLevel || "",
        heardAboutUs: u.onboarding?.heardAboutUs || "",
      });
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

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.patch("/users/profile", {
        name: profile.name,
        phoneNumber: profile.phoneNumber,
        country: profile.country,
        timezone: profile.timezone,
        company: profile.company,
        onboarding: {
          contentNiche: profile.niche,
          role: profile.role,
          primaryGoal: profile.primaryGoal,
          experienceLevel: profile.experienceLevel,
          heardAboutUs: profile.heardAboutUs,
        },
      });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    }
    setSaving(false);
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
          { key: "profile",       label: "Profile",       icon: User },
          { key: "notifications", label: "Notifications", icon: Bell },
          { key: "security",      label: "Security",      icon: Shield },
        ] as const).map(({ key, label: lbl2, icon: Icon }) => (
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
          {/* ── PROFILE ── */}
          {tab === "profile" && (
            <>
              <Section title="Personal Information" icon={User} colors={colors}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
                  <div>
                    {lbl("Full Name")}
                    <input value={profile.name}
                      onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                      style={inp} placeholder="Your full name" />
                  </div>
                  <div>
                    {lbl("Email Address")}
                    <input value={profile.email} disabled
                      style={{ ...inp, opacity: 0.6, cursor: "not-allowed" }} />
                  </div>
                  <div>
                    {lbl("Phone Number")}
                    <input value={profile.phoneNumber}
                      onChange={(e) => setProfile(p => ({ ...p, phoneNumber: e.target.value }))}
                      style={inp} placeholder="+971 50 123 4567" />
                  </div>
                  <div>
                    {lbl("Company / Business")}
                    <input value={profile.company}
                      onChange={(e) => setProfile(p => ({ ...p, company: e.target.value }))}
                      style={inp} placeholder="My Company LLC" />
                  </div>
                  <div>
                    {lbl("Country")}
                    <ReactSelect
                      options={COUNTRIES}
                      value={profile.country ? { value: profile.country, label: profile.country } : null}
                      onChange={(opt: any) => setProfile(p => ({ ...p, country: opt?.value || "" }))}
                      styles={selectStyles}
                      placeholder="Select country..."
                      isSearchable
                      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                      menuPosition="fixed"
                    />
                  </div>
                  <div>
                    {lbl("Timezone")}
                    <ReactSelect
                      options={TIMEZONES}
                      value={profile.timezone ? TIMEZONES.find(t => t.value === profile.timezone) || null : null}
                      onChange={(opt: any) => setProfile(p => ({ ...p, timezone: opt?.value || "" }))}
                      styles={selectStyles}
                      placeholder="Select timezone..."
                      isSearchable
                      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                      menuPosition="fixed"
                    />
                  </div>
                </div>
                <SaveBtn onClick={saveProfile} />
              </Section>

              <Section title="Content Preferences" icon={User} colors={colors}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
                  <div>
                    {lbl("Content Niche")}
                    <ReactSelect
                      options={NICHES}
                      value={profile.niche ? { value: profile.niche, label: profile.niche } : null}
                      onChange={(opt: any) => setProfile(p => ({ ...p, niche: opt?.value || "" }))}
                      styles={selectStyles}
                      placeholder="Select niche..."
                      isSearchable
                      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                      menuPosition="fixed"
                    />
                  </div>
                  <div>
                    {lbl("Your Role")}
                    <ReactSelect
                      options={ROLES}
                      value={profile.role ? { value: profile.role, label: profile.role } : null}
                      onChange={(opt: any) => setProfile(p => ({ ...p, role: opt?.value || "" }))}
                      styles={selectStyles}
                      placeholder="Select role..."
                      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                      menuPosition="fixed"
                    />
                  </div>
                  <div>
                    {lbl("Primary Goal")}
                    <ReactSelect
                      options={GOALS}
                      value={profile.primaryGoal ? { value: profile.primaryGoal, label: profile.primaryGoal } : null}
                      onChange={(opt: any) => setProfile(p => ({ ...p, primaryGoal: opt?.value || "" }))}
                      styles={selectStyles}
                      placeholder="Select goal..."
                      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                      menuPosition="fixed"
                    />
                  </div>
                  <div>
                    {lbl("Experience Level")}
                    <ReactSelect
                      options={EXPERIENCE}
                      value={profile.experienceLevel ? { value: profile.experienceLevel, label: profile.experienceLevel } : null}
                      onChange={(opt: any) => setProfile(p => ({ ...p, experienceLevel: opt?.value || "" }))}
                      styles={selectStyles}
                      placeholder="Select level..."
                      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                      menuPosition="fixed"
                    />
                  </div>
                  <div>
                    {lbl("How did you hear about us?")}
                    <ReactSelect
                      options={HEARD_ABOUT}
                      value={profile.heardAboutUs ? { value: profile.heardAboutUs, label: profile.heardAboutUs } : null}
                      onChange={(opt: any) => setProfile(p => ({ ...p, heardAboutUs: opt?.value || "" }))}
                      styles={selectStyles}
                      placeholder="Select source..."
                      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                      menuPosition="fixed"
                    />
                  </div>
                </div>
                <SaveBtn onClick={saveProfile} />
              </Section>

              <Section title="Appearance" icon={isDark ? Moon : Sun} colors={colors}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", background: colors.bg,
                  border: `1px solid ${colors.border}`, borderRadius: "9px",
                }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text }}>Dark Mode</p>
                    <p style={{ fontSize: "11px", color: colors.textMuted }}>Switch between light and dark theme</p>
                  </div>
                  <Toggle value={isDark} onChange={toggleTheme} />
                </div>
              </Section>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === "notifications" && (
            <Section title="Notification Preferences" icon={Bell} colors={colors}>
              <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "18px" }}>
                Email notifications sent to <strong style={{ color: colors.text }}>{profile.email}</strong>
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}