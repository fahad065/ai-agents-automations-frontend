"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import {
  ArrowLeft, Loader2, Save, Settings, BookOpen, Radio, MessageSquare,
  BarChart3, Plus, Trash2, X, Globe, Copy, ChevronDown, ChevronUp,
  AlertCircle, HelpCircle, FileText, Link2, User as UserIcon, Bot as BotIcon,
  DollarSign, CheckCircle2, Clock, Mail,
} from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { toast } from "sonner";
import { ChatbotTrialBanner } from "./chatbot-trial-banner";

// ── Types ────────────────────────────────────────────────────
interface WebsiteChannel {
  enabled?: boolean;
  customColor?: string;
  welcomeMessage?: string;
  welcomeMessage_ar?: string;
}
interface WhatsappChannel {
  enabled?: boolean;
  phoneNumberId?: string;
  accessToken?: string;
  verifyToken?: string;
  webhookVerified?: boolean;
}
interface InstagramChannel {
  enabled?: boolean;
  accountId?: string;
  accessToken?: string;
  webhookVerified?: boolean;
}
interface Channels {
  website: WebsiteChannel;
  whatsapp: WhatsappChannel;
  instagram: InstagramChannel;
}

interface Chatbot {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  persona?: string;
  language: "en" | "ar" | "both";
  template?: string;
  status: "draft" | "active" | "inactive";
  fallbackMessage?: string;
  fallbackMessage_ar?: string;
  humanHandoff?: boolean;
  embedKey: string;
  channels: Channels;
  billing: Billing;
  createdAt: string;
  updatedAt?: string;
}

interface Billing {
  setupFee: number;
  monthlyFee: number;
  currency: string;
  status: "trial" | "awaiting_setup_payment" | "active" | "past_due" | "suspended";
  trialEndsAt?: string;
  setupPaidAt?: string;
  lastBillingDate?: string;
  nextBillingDate?: string;
  notes?: string;
}

interface BillingRecord {
  _id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  description: string;
  billingDate: string;
}

const BANK_DETAILS = {
  bankName: "Emirates NBD",
  accountName: "Fahad Abdul Faheem",
  accountNumber: "1015821777301",
  iban: "AE720260001015821777301",
  swiftCode: "EBILAEAD",
};

const BILLING_STATUS_LABEL: Record<string, string> = {
  trial: "Trial",
  awaiting_setup_payment: "Awaiting Setup Payment",
  active: "Active",
  past_due: "Past Due",
  suspended: "Suspended",
};
const BILLING_STATUS_COLOR: Record<string, string> = {
  trial: "#f59e0b",
  awaiting_setup_payment: "#ef4444",
  active: "#22c55e",
  past_due: "#ef4444",
  suspended: "#6b7280",
};

interface KnowledgeEntry {
  _id: string;
  type: "text" | "faq" | "url";
  question?: string;
  answer?: string;
  content?: string;
  sourceUrl?: string;
  createdAt: string;
}

interface ConvMessage {
  role: string;
  content: string;
  timestamp: string;
}
interface Conversation {
  _id: string;
  sessionId: string;
  channel: string;
  messages: ConvMessage[];
  status: string;
  createdAt: string;
}

interface Analytics {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  handoffs: number;
  byChannel: { website: number; whatsapp: number; instagram: number };
}

const EMPTY_CHANNELS: Channels = {
  website: { enabled: false, customColor: "#7c3aed", welcomeMessage: "", welcomeMessage_ar: "" },
  whatsapp: { enabled: false, phoneNumberId: "", accessToken: "" },
  instagram: { enabled: false, accountId: "", accessToken: "" },
};

const TABS = [
  { key: "overview", label: "Overview", icon: Settings },
  { key: "knowledge", label: "Knowledge Base", icon: BookOpen },
  { key: "channels", label: "Channels", icon: Radio },
  { key: "conversations", label: "Conversations", icon: MessageSquare },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "billing", label: "Billing", icon: DollarSign },
] as const;

type TabKey = typeof TABS[number]["key"];

// ── Shared UI helpers ────────────────────────────────────────
function Section({ title, icon: Icon, children, colors, right }: {
  title: string; icon: any; children: React.ReactNode; colors: any; right?: React.ReactNode;
}) {
  return (
    <div style={{
      background: colors.bgCard, border: `1px solid ${colors.border}`,
      borderRadius: "12px", overflow: "hidden", marginBottom: "16px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
        padding: "16px 20px", borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Icon size={15} color="#a78bfa" />
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>{title}</h2>
        </div>
        {right}
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange, colors }: { value: boolean; onChange: () => void; colors: any }) {
  return (
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
}

function SaveBtn({ onClick, saving, label = "Save Changes" }: { onClick: () => void; saving: boolean; label?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
      <button onClick={onClick} disabled={saving} style={{
        display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px",
        borderRadius: "8px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
        color: "white", border: "none", cursor: saving ? "not-allowed" : "pointer",
        fontSize: "13px", fontWeight: 600, opacity: saving ? 0.7 : 1,
        boxShadow: saving ? "none" : "0 4px 12px rgba(124,58,237,0.3)",
      }}>
        {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
        {saving ? "Saving..." : label}
      </button>
    </div>
  );
}

const copyText = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Failed to copy");
  }
};

// ── Main ──────────────────────────────────────────────────────
export function ChatbotConfigPage({ id }: { id: string }) {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("overview");

  // Overview form
  const [overview, setOverview] = useState({
    name: "", description: "", persona: "", language: "en" as "en" | "ar" | "both",
    fallbackMessage: "", fallbackMessage_ar: "", humanHandoff: false,
  });
  const [overviewSaving, setOverviewSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  // Knowledge
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [knowledgeLoaded, setKnowledgeLoaded] = useState(false);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [showAddKnowledge, setShowAddKnowledge] = useState(false);

  // Channels
  const [channels, setChannels] = useState<Channels>(EMPTY_CHANNELS);
  const [savingChannel, setSavingChannel] = useState<string | null>(null);
  const [embedCode, setEmbedCode] = useState("");
  const [embedLoading, setEmbedLoading] = useState(false);

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [expandedConvo, setExpandedConvo] = useState<string | null>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Billing
  const { user } = useAuthStore();
  const isAdmin = (user as any)?.role === "admin";
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [billingLoaded, setBillingLoaded] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [pricingForm, setPricingForm] = useState({
    setupFee: "0", monthlyFee: "0", currency: "USD", trialEndsAt: "", notes: "",
  });
  const [pricingSaving, setPricingSaving] = useState(false);
  const [payKind, setPayKind] = useState<"setup" | "monthly">("setup");
  const [transactionRef, setTransactionRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [notifySending, setNotifySending] = useState(false);
  const [notifySent, setNotifySent] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => { fetchChatbot(); }, [id]);

  useEffect(() => {
    if (tab === "knowledge" && !knowledgeLoaded) fetchKnowledge();
    if (tab === "conversations" && !conversationsLoaded) fetchConversations();
    if (tab === "analytics" && !analyticsLoaded) fetchAnalytics();
    if (tab === "billing" && !billingLoaded) fetchBilling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab === "channels" && channels.website?.enabled && chatbot && !embedCode) {
      fetchEmbedCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, channels.website?.enabled, chatbot]);

  const fetchChatbot = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/chatbots/${id}`);
      const bot: Chatbot = res.data?.data || res.data;
      setChatbot(bot);
      setOverview({
        name: bot.name || "",
        description: bot.description || "",
        persona: bot.persona || "",
        language: bot.language || "en",
        fallbackMessage: bot.fallbackMessage || "",
        fallbackMessage_ar: bot.fallbackMessage_ar || "",
        humanHandoff: !!bot.humanHandoff,
      });
      setChannels({
        website: { ...EMPTY_CHANNELS.website, ...(bot.channels?.website || {}) },
        whatsapp: { ...EMPTY_CHANNELS.whatsapp, ...(bot.channels?.whatsapp || {}) },
        instagram: { ...EMPTY_CHANNELS.instagram, ...(bot.channels?.instagram || {}) },
      });
    } catch {
      toast.error("Failed to load chatbot");
    }
    setLoading(false);
  };

  const fetchKnowledge = async () => {
    setKnowledgeLoading(true);
    try {
      const res = await api.get(`/chatbots/${id}/knowledge`);
      setKnowledge(res.data?.data || res.data || []);
      setKnowledgeLoaded(true);
    } catch {
      toast.error("Failed to load knowledge base");
    }
    setKnowledgeLoading(false);
  };

  const fetchConversations = async () => {
    setConversationsLoading(true);
    try {
      const res = await api.get(`/chatbots/${id}/conversations?limit=20`);
      setConversations(res.data?.data || res.data || []);
      setConversationsLoaded(true);
    } catch {
      toast.error("Failed to load conversations");
    }
    setConversationsLoading(false);
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await api.get(`/chatbots/${id}/analytics`);
      setAnalytics(res.data?.data || res.data);
      setAnalyticsLoaded(true);
    } catch {
      toast.error("Failed to load analytics");
    }
    setAnalyticsLoading(false);
  };

  const fetchBilling = async () => {
    setBillingLoading(true);
    try {
      const res = await api.get(`/chatbots/${id}/billing`);
      const data = res.data?.data || res.data;
      setBillingHistory(data.history || []);
      const b: Billing | undefined = data.billing;
      if (b) {
        setPricingForm({
          setupFee: String(b.setupFee ?? 0),
          monthlyFee: String(b.monthlyFee ?? 0),
          currency: b.currency || "USD",
          trialEndsAt: b.trialEndsAt ? b.trialEndsAt.slice(0, 10) : "",
          notes: b.notes || "",
        });
      }
      setBillingLoaded(true);
    } catch {
      toast.error("Failed to load billing info");
    }
    setBillingLoading(false);
  };

  const savePricing = async () => {
    setPricingSaving(true);
    try {
      const res = await api.put(`/chatbots/${id}/pricing`, {
        setupFee: Number(pricingForm.setupFee) || 0,
        monthlyFee: Number(pricingForm.monthlyFee) || 0,
        currency: pricingForm.currency,
        trialEndsAt: pricingForm.trialEndsAt || undefined,
        notes: pricingForm.notes,
      });
      setChatbot((c) => c ? { ...c, billing: res.data?.data?.billing || res.data.billing } : c);
      toast.success("Pricing saved");
    } catch {
      toast.error("Failed to save pricing");
    }
    setPricingSaving(false);
  };

  const submitNotifyPayment = async () => {
    if (!transactionRef.trim()) { toast.error("Enter your transaction reference"); return; }
    setNotifySending(true);
    try {
      await api.post(`/chatbots/${id}/notify-payment`, {
        kind: payKind, transactionRef, notes: payNotes,
      });
      setNotifySent(true);
      toast.success("Payment notification sent — we'll verify and activate within 24 hours");
    } catch {
      toast.error("Failed to send. Email hello@logicmate.io directly.");
    }
    setNotifySending(false);
  };

  const confirmPayment = async (kind: "setup" | "monthly") => {
    setConfirming(kind);
    try {
      const res = await api.post(`/chatbots/${id}/confirm-payment`, { kind });
      setChatbot((c) => c ? { ...c, billing: res.data?.data?.billing || res.data.billing } : c);
      toast.success(`${kind === "setup" ? "Setup" : "Monthly"} payment confirmed`);
      fetchBilling();
    } catch {
      toast.error("Failed to confirm payment");
    }
    setConfirming(null);
  };

  const fetchEmbedCode = async () => {
    setEmbedLoading(true);
    try {
      const res = await api.get(`/chatbots/${id}/embed-code`);
      setEmbedCode(res.data?.embedCode || "");
    } catch {
      // silent — website may not be enabled yet
    }
    setEmbedLoading(false);
  };

  const saveOverview = async () => {
    setOverviewSaving(true);
    try {
      await api.put(`/chatbots/${id}`, {
        name: overview.name,
        description: overview.description,
        persona: overview.persona,
        language: overview.language,
        fallbackMessage: overview.fallbackMessage,
        fallbackMessage_ar: overview.fallbackMessage_ar,
        humanHandoff: overview.humanHandoff,
      });
      toast.success("Chatbot updated");
      fetchChatbot();
    } catch {
      toast.error("Failed to save changes");
    }
    setOverviewSaving(false);
  };

  const updateStatus = async (status: "draft" | "active" | "inactive") => {
    if (!chatbot || chatbot.status === status) return;
    setStatusSaving(true);
    try {
      await api.put(`/chatbots/${id}`, { status });
      setChatbot((prev) => (prev ? { ...prev, status } : prev));
      toast.success(`Chatbot is now ${status === "active" ? "live" : status}`);
    } catch {
      toast.error("Failed to change status");
    }
    setStatusSaving(false);
  };

  const saveChannel = async (key: "website" | "whatsapp" | "instagram") => {
    setSavingChannel(key);
    try {
      await api.put(`/chatbots/${id}`, { channels });
      toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} channel saved`);
      if (key === "website" && channels.website.enabled) fetchEmbedCode();
      fetchChatbot();
    } catch {
      toast.error("Failed to save channel");
    }
    setSavingChannel(null);
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px" }}>
        <Loader2 size={28} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div style={{ textAlign: "center", padding: "80px" }}>
        <p style={{ color: colors.textMuted, fontSize: "14px" }}>Chatbot not found.</p>
        <button onClick={() => router.push("/dashboard/chatbots")} style={{ marginTop: "16px", padding: "9px 18px", borderRadius: "8px", background: "#7c3aed", color: "white", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
          Back to Chatbots
        </button>
      </div>
    );
  }

  const statusMeta: Record<string, { label: string; desc: string; color: string; bg: string }> = {
    draft: { label: "Draft", desc: "Bot is in draft — not visible to customers yet.", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    active: { label: "Live", desc: "Bot is live and responding to customers.", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    inactive: { label: "Paused", desc: "Bot is paused — customers won't get replies.", color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  };

  return (
    <div>
      {/* Breadcrumb */}
      <button onClick={() => router.push("/dashboard/chatbots")} style={{
        display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none",
        cursor: "pointer", color: colors.textMuted, fontSize: "13px", padding: 0, marginBottom: "14px",
      }}>
        <ArrowLeft size={14} /> Back to Chatbots
      </button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>{chatbot.name}</h1>
          <p style={{ fontSize: "13px", color: colors.textMuted }}>Configure, connect channels, and monitor this chatbot.</p>
        </div>
        <span style={{
          fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "9999px",
          background: statusMeta[chatbot.status]?.bg, color: statusMeta[chatbot.status]?.color,
        }}>
          {statusMeta[chatbot.status]?.label || chatbot.status}
        </span>
      </div>

      <ChatbotTrialBanner billing={chatbot.billing} onGoToBilling={() => setTab("billing")} />

      {/* Tabs */}
      <div style={{
        display: "flex", gap: "2px", marginBottom: "20px", overflowX: "auto",
        background: colors.bgCard, border: `1px solid ${colors.border}`,
        borderRadius: "10px", padding: "4px", width: "fit-content",
      }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap",
            padding: "7px 16px", borderRadius: "7px", fontSize: "13px",
            fontWeight: tab === key ? 600 : 400, cursor: "pointer", border: "none",
            background: tab === key ? (isDark ? "#1a1a1a" : "#ffffff") : "transparent",
            color: tab === key ? colors.text : colors.textMuted,
            boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
          }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <>
          <Section title="Status" icon={Radio} colors={colors}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", background: statusMeta[chatbot.status]?.bg,
              border: `1px solid ${statusMeta[chatbot.status]?.color}30`, borderRadius: "9px", marginBottom: "14px", flexWrap: "wrap", gap: "10px",
            }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>{statusMeta[chatbot.status]?.desc}</p>
              </div>
              {statusSaving && <Loader2 size={16} color={statusMeta[chatbot.status]?.color} style={{ animation: "spin 1s linear infinite" }} />}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["draft", "active", "inactive"] as const).map((s) => (
                <button key={s} onClick={() => updateStatus(s)} disabled={statusSaving} style={{
                  flex: 1, padding: "10px", borderRadius: "8px", cursor: statusSaving ? "not-allowed" : "pointer",
                  border: `1.5px solid ${chatbot.status === s ? statusMeta[s].color : colors.border}`,
                  background: chatbot.status === s ? statusMeta[s].bg : colors.bg,
                  color: chatbot.status === s ? statusMeta[s].color : colors.text,
                  fontSize: "13px", fontWeight: 600,
                }}>
                  {statusMeta[s].label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Basic Info" icon={Settings} colors={colors}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", marginBottom: "14px" }}>
              <div>
                {lbl("Name")}
                <input value={overview.name} onChange={(e) => setOverview((o) => ({ ...o, name: e.target.value }))} style={inp} />
              </div>
              <div>
                {lbl("Language")}
                <div style={{ display: "flex", gap: "6px" }}>
                  {([
                    { value: "en", label: "English" },
                    { value: "ar", label: "Arabic" },
                    { value: "both", label: "Both" },
                  ] as const).map((l) => (
                    <button key={l.value} onClick={() => setOverview((o) => ({ ...o, language: l.value }))} style={{
                      flex: 1, padding: "9px", borderRadius: "8px", cursor: "pointer",
                      border: `1.5px solid ${overview.language === l.value ? "#7c3aed" : colors.border}`,
                      background: overview.language === l.value ? "rgba(124,58,237,0.1)" : colors.bg,
                      color: overview.language === l.value ? "#a78bfa" : colors.text,
                      fontSize: "12px", fontWeight: 600,
                    }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginBottom: "14px" }}>
              {lbl("Description")}
              <textarea value={overview.description} onChange={(e) => setOverview((o) => ({ ...o, description: e.target.value }))} rows={2} style={{ ...inp, resize: "vertical" as const }} />
            </div>
            <div>
              {lbl("Persona — how should the bot sound and behave?")}
              <textarea value={overview.persona} onChange={(e) => setOverview((o) => ({ ...o, persona: e.target.value }))} rows={3}
                style={{ ...inp, resize: "vertical" as const }} placeholder="e.g. Friendly, concise, always offers to book a call if the user seems unsure." />
            </div>
            <SaveBtn onClick={saveOverview} saving={overviewSaving} />
          </Section>

          <Section title="Fallback & Handoff" icon={AlertCircle} colors={colors}>
            <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "14px" }}>
              Shown when the bot can't answer a question from its knowledge base.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", marginBottom: "16px" }}>
              <div>
                {lbl("Fallback Message (English)")}
                <textarea value={overview.fallbackMessage} onChange={(e) => setOverview((o) => ({ ...o, fallbackMessage: e.target.value }))} rows={2}
                  style={{ ...inp, resize: "vertical" as const }} placeholder="Sorry, I don't have that information. Let me connect you with our team." />
              </div>
              <div style={{
                padding: "10px", borderRadius: "8px",
                background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)",
              }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 500, color: "#f59e0b", marginBottom: "5px" }}>
                  Fallback Message (Arabic)
                </label>
                <textarea value={overview.fallbackMessage_ar} onChange={(e) => setOverview((o) => ({ ...o, fallbackMessage_ar: e.target.value }))} rows={2}
                  dir="rtl" style={{ ...inp, resize: "vertical" as const, textAlign: "right" as const, background: colors.bg }} placeholder="عذراً، ما عندي هالمعلومة. راح أوصلك بفريقنا." />
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", background: colors.bg,
              border: `1px solid ${colors.border}`, borderRadius: "9px",
            }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text }}>Human Handoff</p>
                <p style={{ fontSize: "11px", color: colors.textMuted }}>Escalate complex or unresolved queries to a human agent.</p>
              </div>
              <Toggle value={overview.humanHandoff} onChange={() => setOverview((o) => ({ ...o, humanHandoff: !o.humanHandoff }))} colors={colors} />
            </div>
            <SaveBtn onClick={saveOverview} saving={overviewSaving} />
          </Section>
        </>
      )}

      {/* ── KNOWLEDGE ── */}
      {tab === "knowledge" && (
        <KnowledgeTab
          botId={id}
          knowledge={knowledge}
          loading={knowledgeLoading}
          showAdd={showAddKnowledge}
          setShowAdd={setShowAddKnowledge}
          colors={colors}
          isDark={isDark}
          refresh={fetchKnowledge}
        />
      )}

      {/* ── CHANNELS ── */}
      {tab === "channels" && (
        <ChannelsTab
          botId={id}
          embedKey={chatbot.embedKey}
          channels={channels}
          setChannels={setChannels}
          savingChannel={savingChannel}
          saveChannel={saveChannel}
          embedCode={embedCode}
          embedLoading={embedLoading}
          colors={colors}
          isDark={isDark}
        />
      )}

      {/* ── CONVERSATIONS ── */}
      {tab === "conversations" && (
        <ConversationsTab
          conversations={conversations}
          loading={conversationsLoading}
          expandedConvo={expandedConvo}
          setExpandedConvo={setExpandedConvo}
          colors={colors}
          isDark={isDark}
        />
      )}

      {/* ── ANALYTICS ── */}
      {tab === "analytics" && (
        <AnalyticsTab analytics={analytics} loading={analyticsLoading} colors={colors} isDark={isDark} />
      )}

      {/* ── BILLING ── */}
      {tab === "billing" && (
        <BillingTab
          billing={chatbot.billing}
          history={billingHistory}
          loading={billingLoading}
          isAdmin={isAdmin}
          colors={colors}
          isDark={isDark}
          pricingForm={pricingForm}
          setPricingForm={setPricingForm}
          savePricing={savePricing}
          pricingSaving={pricingSaving}
          payKind={payKind}
          setPayKind={setPayKind}
          transactionRef={transactionRef}
          setTransactionRef={setTransactionRef}
          payNotes={payNotes}
          setPayNotes={setPayNotes}
          notifySending={notifySending}
          notifySent={notifySent}
          submitNotifyPayment={submitNotifyPayment}
          confirming={confirming}
          confirmPayment={confirmPayment}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Knowledge Tab ────────────────────────────────────────────
function KnowledgeTab({ botId, knowledge, loading, showAdd, setShowAdd, colors, isDark, refresh }: {
  botId: string; knowledge: KnowledgeEntry[]; loading: boolean;
  showAdd: boolean; setShowAdd: (v: boolean) => void; colors: any; isDark: boolean; refresh: () => void;
}) {
  const [type, setType] = useState<"faq" | "text" | "url">("faq");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit",
  };

  const reset = () => { setType("faq"); setQuestion(""); setAnswer(""); setContent(""); setSourceUrl(""); };

  const addEntry = async () => {
    if (type === "faq" && (!question.trim() || !answer.trim())) { toast.error("Question and answer are required"); return; }
    if (type === "text" && !content.trim()) { toast.error("Content is required"); return; }
    if (type === "url" && !sourceUrl.trim()) { toast.error("URL is required"); return; }
    setSaving(true);
    try {
      const body: any = { type };
      if (type === "faq") { body.question = question.trim(); body.answer = answer.trim(); }
      if (type === "text") { body.content = content.trim(); }
      if (type === "url") { body.sourceUrl = sourceUrl.trim(); }
      await api.post(`/chatbots/${botId}/knowledge`, body);
      toast.success("Knowledge entry added");
      reset();
      setShowAdd(false);
      refresh();
    } catch {
      toast.error("Failed to add entry");
    }
    setSaving(false);
  };

  const deleteEntry = async (kId: string) => {
    if (!confirm("Delete this knowledge entry?")) return;
    try {
      await api.delete(`/chatbots/${botId}/knowledge/${kId}`);
      toast.success("Entry deleted");
      refresh();
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  const typeIcon: Record<string, any> = { faq: HelpCircle, text: FileText, url: Link2 };
  const typeColor: Record<string, string> = { faq: "#7c3aed", text: "#3b82f6", url: "#22c55e" };

  return (
    <Section
      title="Knowledge Base"
      icon={BookOpen}
      colors={colors}
      right={
        <button onClick={() => setShowAdd(!showAdd)} style={{
          display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px",
          borderRadius: "7px", background: "#7c3aed", color: "white", border: "none",
          cursor: "pointer", fontSize: "12px", fontWeight: 600,
        }}>
          {showAdd ? <X size={12} /> : <Plus size={12} />} {showAdd ? "Cancel" : "Add Knowledge"}
        </button>
      }
    >
      <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "16px", lineHeight: 1.6 }}>
        The bot only answers from what you add here — add your FAQs, policies, or paste website content.
      </p>

      {showAdd && (
        <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
            {([
              { value: "faq", label: "FAQ" },
              { value: "text", label: "Text" },
              { value: "url", label: "URL" },
            ] as const).map((t) => (
              <button key={t.value} onClick={() => setType(t.value)} style={{
                flex: 1, padding: "8px", borderRadius: "7px", cursor: "pointer",
                border: `1.5px solid ${type === t.value ? typeColor[t.value] : colors.border}`,
                background: type === t.value ? `${typeColor[t.value]}12` : colors.bgCard,
                color: type === t.value ? typeColor[t.value] : colors.text,
                fontSize: "12px", fontWeight: 600,
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {type === "faq" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>Question</label>
                <input value={question} onChange={(e) => setQuestion(e.target.value)} style={inp} placeholder="What are your opening hours?" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>Answer</label>
                <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={2} style={{ ...inp, resize: "vertical" as const }} placeholder="We're open daily from 9am to 11pm." />
              </div>
            </div>
          )}

          {type === "text" && (
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>Content</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} style={{ ...inp, resize: "vertical" as const }} placeholder="Paste your policy, product info, or any reference text..." />
            </div>
          )}

          {type === "url" && (
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>Source URL</label>
              <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} style={inp} placeholder="https://example.com/faq" />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
            <button onClick={addEntry} disabled={saving} style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "9px 20px",
              borderRadius: "8px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "white", border: "none", cursor: saving ? "not-allowed" : "pointer",
              fontSize: "13px", fontWeight: 600, opacity: saving ? 0.7 : 1,
            }}>
              {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={14} />}
              {saving ? "Adding..." : "Add Entry"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <Loader2 size={22} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      ) : knowledge.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", border: `1px dashed ${colors.border}`, borderRadius: "10px" }}>
          <BookOpen size={28} color={colors.textMuted} style={{ margin: "0 auto 10px" }} />
          <p style={{ fontSize: "13px", color: colors.textMuted }}>No knowledge added yet. Add your first FAQ, text, or URL.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {knowledge.map((k) => {
            const Icon = typeIcon[k.type] || FileText;
            return (
              <div key={k._id} style={{
                display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px",
                background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: "9px",
              }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "7px", flexShrink: 0,
                  background: `${typeColor[k.type]}12`, border: `1px solid ${typeColor[k.type]}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={13} color={typeColor[k.type]} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {k.type === "faq" && (
                    <>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text, marginBottom: "3px" }}>{k.question}</p>
                      <p style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.5 }}>{k.answer}</p>
                    </>
                  )}
                  {k.type === "text" && (
                    <p style={{ fontSize: "12px", color: colors.text, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                      {k.content}
                    </p>
                  )}
                  {k.type === "url" && (
                    <a href={k.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#a78bfa", wordBreak: "break-all" as const }}>
                      {k.sourceUrl}
                    </a>
                  )}
                </div>
                <button onClick={() => deleteEntry(k._id)} title="Delete" style={{
                  width: "26px", height: "26px", borderRadius: "6px", cursor: "pointer", flexShrink: 0,
                  border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "#ef4444",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

// ── Channels Tab ─────────────────────────────────────────────
function ChannelsTab({ botId, embedKey, channels, setChannels, savingChannel, saveChannel, embedCode, embedLoading, colors, isDark }: {
  botId: string; embedKey: string; channels: Channels; setChannels: (fn: (c: Channels) => Channels) => void;
  savingChannel: string | null; saveChannel: (key: "website" | "whatsapp" | "instagram") => void;
  embedCode: string; embedLoading: boolean; colors: any; isDark: boolean;
}) {
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
  const whatsappWebhook = `${apiUrl}/webhooks/whatsapp/${embedKey}`;
  const instagramWebhook = `${apiUrl}/webhooks/instagram/${embedKey}`;

  return (
    <>
      {/* Website */}
      <Section
        title="Website Widget"
        icon={Globe}
        colors={colors}
        right={<Toggle value={!!channels.website.enabled} onChange={() => setChannels((c) => ({ ...c, website: { ...c.website, enabled: !c.website.enabled } }))} colors={colors} />}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", marginBottom: "14px" }}>
          <div>
            {lbl("Widget Color")}
            <input type="color" value={channels.website.customColor || "#7c3aed"}
              onChange={(e) => setChannels((c) => ({ ...c, website: { ...c.website, customColor: e.target.value } }))}
              style={{ width: "100%", height: "38px", borderRadius: "8px", border: `1px solid ${colors.border}`, background: colors.bg, cursor: "pointer", padding: "3px" }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", marginBottom: "14px" }}>
          <div>
            {lbl("Welcome Message (English)")}
            <textarea value={channels.website.welcomeMessage || ""} rows={2}
              onChange={(e) => setChannels((c) => ({ ...c, website: { ...c.website, welcomeMessage: e.target.value } }))}
              style={{ ...inp, resize: "vertical" as const }} placeholder="Hi! How can I help you today?" />
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#f59e0b", marginBottom: "5px" }}>Welcome Message (Arabic)</label>
            <textarea value={channels.website.welcomeMessage_ar || ""} rows={2} dir="rtl"
              onChange={(e) => setChannels((c) => ({ ...c, website: { ...c.website, welcomeMessage_ar: e.target.value } }))}
              style={{ ...inp, resize: "vertical" as const, textAlign: "right" as const, background: colors.bg }} placeholder="هلا! كيف أقدر أساعدك اليوم؟" />
          </div>
        </div>

        {channels.website.enabled && (
          <div style={{ marginBottom: "14px" }}>
            {lbl("Embed Code")}
            {embedLoading ? (
              <div style={{ padding: "16px", textAlign: "center" }}>
                <Loader2 size={16} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : embedCode ? (
              <div style={{ position: "relative" }}>
                <pre style={{
                  background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: "8px",
                  padding: "14px", fontSize: "11px", color: colors.text, overflow: "auto",
                  maxHeight: "160px", margin: 0, whiteSpace: "pre-wrap" as const, wordBreak: "break-all" as const,
                }}>{embedCode}</pre>
                <button onClick={() => copyText(embedCode, "Embed code")} style={{
                  position: "absolute", top: "8px", right: "8px", display: "flex", alignItems: "center", gap: "5px",
                  padding: "5px 10px", borderRadius: "6px", background: colors.bgCard, border: `1px solid ${colors.border}`,
                  color: colors.text, cursor: "pointer", fontSize: "11px", fontWeight: 600,
                }}>
                  <Copy size={11} /> Copy
                </button>
              </div>
            ) : (
              <p style={{ fontSize: "12px", color: colors.textMuted }}>Save with the website channel enabled to generate the embed code.</p>
            )}
          </div>
        )}

        <SaveBtn onClick={() => saveChannel("website")} saving={savingChannel === "website"} label="Save Website Channel" />
      </Section>

      {/* WhatsApp */}
      <Section
        title="WhatsApp"
        icon={FaWhatsapp}
        colors={colors}
        right={<Toggle value={!!channels.whatsapp.enabled} onChange={() => setChannels((c) => ({ ...c, whatsapp: { ...c.whatsapp, enabled: !c.whatsapp.enabled } }))} colors={colors} />}
      >
        <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "14px" }}>
          Get these from your Meta Business App → WhatsApp → API Setup.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", marginBottom: "14px" }}>
          <div>
            {lbl("Phone Number ID")}
            <input type="password" value={channels.whatsapp.phoneNumberId || ""}
              onChange={(e) => setChannels((c) => ({ ...c, whatsapp: { ...c.whatsapp, phoneNumberId: e.target.value } }))}
              style={inp} placeholder="•••••••••••" />
          </div>
          <div>
            {lbl("Access Token")}
            <input type="password" value={channels.whatsapp.accessToken || ""}
              onChange={(e) => setChannels((c) => ({ ...c, whatsapp: { ...c.whatsapp, accessToken: e.target.value } }))}
              style={inp} placeholder="•••••••••••" />
          </div>
        </div>
        <div style={{ marginBottom: "14px" }}>
          {lbl("Webhook URL — paste this into Meta")}
          <div style={{ display: "flex", gap: "8px" }}>
            <input readOnly value={whatsappWebhook} style={{ ...inp, color: colors.textMuted, cursor: "text" }} />
            <button onClick={() => copyText(whatsappWebhook, "Webhook URL")} style={{
              padding: "0 14px", borderRadius: "8px", background: colors.bg, border: `1px solid ${colors.border}`,
              color: colors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, flexShrink: 0,
            }}>
              <Copy size={12} /> Copy
            </button>
          </div>
        </div>
        <SaveBtn onClick={() => saveChannel("whatsapp")} saving={savingChannel === "whatsapp"} label="Save WhatsApp Channel" />
      </Section>

      {/* Instagram */}
      <Section
        title="Instagram"
        icon={FaInstagram}
        colors={colors}
        right={<Toggle value={!!channels.instagram.enabled} onChange={() => setChannels((c) => ({ ...c, instagram: { ...c.instagram, enabled: !c.instagram.enabled } }))} colors={colors} />}
      >
        <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "14px" }}>
          Requires Meta App Review for the <code>instagram_manage_messages</code> permission.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", marginBottom: "14px" }}>
          <div>
            {lbl("Account ID")}
            <input type="password" value={channels.instagram.accountId || ""}
              onChange={(e) => setChannels((c) => ({ ...c, instagram: { ...c.instagram, accountId: e.target.value } }))}
              style={inp} placeholder="•••••••••••" />
          </div>
          <div>
            {lbl("Access Token")}
            <input type="password" value={channels.instagram.accessToken || ""}
              onChange={(e) => setChannels((c) => ({ ...c, instagram: { ...c.instagram, accessToken: e.target.value } }))}
              style={inp} placeholder="•••••••••••" />
          </div>
        </div>
        <div style={{ marginBottom: "14px" }}>
          {lbl("Webhook URL — paste this into Meta")}
          <div style={{ display: "flex", gap: "8px" }}>
            <input readOnly value={instagramWebhook} style={{ ...inp, color: colors.textMuted, cursor: "text" }} />
            <button onClick={() => copyText(instagramWebhook, "Webhook URL")} style={{
              padding: "0 14px", borderRadius: "8px", background: colors.bg, border: `1px solid ${colors.border}`,
              color: colors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, flexShrink: 0,
            }}>
              <Copy size={12} /> Copy
            </button>
          </div>
        </div>
        <SaveBtn onClick={() => saveChannel("instagram")} saving={savingChannel === "instagram"} label="Save Instagram Channel" />
      </Section>
    </>
  );
}

// ── Conversations Tab ────────────────────────────────────────
const CHANNEL_ICON: Record<string, any> = { website: Globe, whatsapp: FaWhatsapp, instagram: FaInstagram };
const CHANNEL_COLOR: Record<string, string> = { website: "#7c3aed", whatsapp: "#22c55e", instagram: "#e1306c" };

function ConversationsTab({ conversations, loading, expandedConvo, setExpandedConvo, colors, isDark }: {
  conversations: Conversation[]; loading: boolean;
  expandedConvo: string | null; setExpandedConvo: (id: string | null) => void;
  colors: any; isDark: boolean;
}) {
  const statusColor: Record<string, { color: string; bg: string }> = {
    active: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    closed: { color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
    handoff: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  };

  return (
    <Section title="Recent Conversations" icon={MessageSquare} colors={colors}>
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <Loader2 size={22} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      ) : conversations.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", border: `1px dashed ${colors.border}`, borderRadius: "10px" }}>
          <MessageSquare size={28} color={colors.textMuted} style={{ margin: "0 auto 10px" }} />
          <p style={{ fontSize: "13px", color: colors.textMuted }}>No conversations yet. They'll appear here once customers start chatting.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {conversations.map((c) => {
            const Icon = CHANNEL_ICON[c.channel] || Globe;
            const chColor = CHANNEL_COLOR[c.channel] || "#7c3aed";
            const sc = statusColor[c.status] || statusColor.closed;
            const lastMsg = c.messages?.[c.messages.length - 1];
            const isOpen = expandedConvo === c._id;
            return (
              <div key={c._id} style={{ border: `1px solid ${colors.border}`, borderRadius: "9px", overflow: "hidden" }}>
                <div onClick={() => setExpandedConvo(isOpen ? null : c._id)} style={{
                  display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px",
                  background: colors.bg, cursor: "pointer",
                }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "7px", flexShrink: 0,
                    background: `${chColor}12`, border: `1px solid ${chColor}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={13} color={chColor} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: colors.text, fontFamily: "monospace" }}>
                        {c.sessionId?.slice(0, 12)}…
                      </p>
                      <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "9999px", background: sc.bg, color: sc.color }}>{c.status}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: colors.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {lastMsg?.content || "No messages"}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                    <p style={{ fontSize: "11px", color: colors.textMuted }}>{c.messages?.length || 0} msgs</p>
                    <p style={{ fontSize: "10px", color: colors.textMuted }}>{new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  {isOpen ? <ChevronUp size={14} color={colors.textMuted} /> : <ChevronDown size={14} color={colors.textMuted} />}
                </div>

                {isOpen && (
                  <div style={{ padding: "14px", background: colors.bgCard, display: "flex", flexDirection: "column", gap: "8px", maxHeight: "360px", overflow: "auto" }}>
                    {(c.messages || []).map((m, i) => {
                      const isUser = m.role === "user";
                      return (
                        <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-start" : "flex-end", gap: "8px" }}>
                          {isUser && (
                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: colors.bg, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <UserIcon size={12} color={colors.textMuted} />
                            </div>
                          )}
                          <div style={{
                            maxWidth: "70%", padding: "8px 12px", borderRadius: "10px", fontSize: "12px", lineHeight: 1.5,
                            background: isUser ? colors.bg : "rgba(124,58,237,0.12)",
                            border: `1px solid ${isUser ? colors.border : "rgba(124,58,237,0.25)"}`,
                            color: colors.text,
                          }}>
                            {m.content}
                            <p style={{ fontSize: "9px", color: colors.textMuted, marginTop: "4px" }}>
                              {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ""}
                            </p>
                          </div>
                          {!isUser && (
                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <BotIcon size={12} color="#a78bfa" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

// ── Analytics Tab ─────────────────────────────────────────────
function AnalyticsTab({ analytics, loading, colors, isDark }: { analytics: Analytics | null; loading: boolean; colors: any; isDark: boolean }) {
  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <Loader2 size={22} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ padding: "40px", textAlign: "center", border: `1px dashed ${colors.border}`, borderRadius: "10px" }}>
        <BarChart3 size={28} color={colors.textMuted} style={{ margin: "0 auto 10px" }} />
        <p style={{ fontSize: "13px", color: colors.textMuted }}>No analytics available yet.</p>
      </div>
    );
  }

  const stats = [
    { label: "Total Conversations", value: analytics.totalConversations, color: "#7c3aed" },
    { label: "Total Messages", value: analytics.totalMessages, color: "#3b82f6" },
    { label: "Avg Msgs / Conversation", value: analytics.avgMessagesPerConversation, color: "#22c55e" },
    { label: "Human Handoffs", value: analytics.handoffs, color: "#f59e0b" },
  ];

  const channelRows = [
    { key: "website", label: "Website", icon: Globe, color: "#7c3aed", value: analytics.byChannel?.website || 0 },
    { key: "whatsapp", label: "WhatsApp", icon: FaWhatsapp, color: "#22c55e", value: analytics.byChannel?.whatsapp || 0 },
    { key: "instagram", label: "Instagram", icon: FaInstagram, color: "#e1306c", value: analytics.byChannel?.instagram || 0 },
  ];
  const maxChannel = Math.max(1, ...channelRows.map((r) => r.value));

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "16px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "18px" }}>
            <p style={{ fontSize: "24px", fontWeight: 800, color: s.color, marginBottom: "4px" }}>{s.value ?? 0}</p>
            <p style={{ fontSize: "12px", color: colors.textMuted }}>{s.label}</p>
          </div>
        ))}
      </div>

      <Section title="Conversations by Channel" icon={BarChart3} colors={colors}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {channelRows.map((r) => {
            const Icon = r.icon;
            const pct = Math.round((r.value / maxChannel) * 100);
            return (
              <div key={r.key}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Icon size={14} color={r.color} />
                    <span style={{ fontSize: "13px", color: colors.text, fontWeight: 500 }}>{r.label}</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: colors.text }}>{r.value}</span>
                </div>
                <div style={{ height: "8px", borderRadius: "9999px", background: colors.bg, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: r.color, borderRadius: "9999px", transition: "width 0.3s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}

// ── Billing Tab ──────────────────────────────────────────────
function BillingTab({
  billing, history, loading, isAdmin, colors, isDark,
  pricingForm, setPricingForm, savePricing, pricingSaving,
  payKind, setPayKind, transactionRef, setTransactionRef, payNotes, setPayNotes,
  notifySending, notifySent, submitNotifyPayment,
  confirming, confirmPayment,
}: {
  billing: Billing; history: BillingRecord[]; loading: boolean; isAdmin: boolean; colors: any; isDark: boolean;
  pricingForm: { setupFee: string; monthlyFee: string; currency: string; trialEndsAt: string; notes: string };
  setPricingForm: (fn: any) => void;
  savePricing: () => void; pricingSaving: boolean;
  payKind: "setup" | "monthly"; setPayKind: (k: "setup" | "monthly") => void;
  transactionRef: string; setTransactionRef: (v: string) => void;
  payNotes: string; setPayNotes: (v: string) => void;
  notifySending: boolean; notifySent: boolean; submitNotifyPayment: () => void;
  confirming: string | null; confirmPayment: (kind: "setup" | "monthly") => void;
}) {
  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <Loader2 size={22} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
      </div>
    );
  }

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit",
  };
  const lbl = (text: string) => (
    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>{text}</label>
  );

  const statusColor = BILLING_STATUS_COLOR[billing?.status] || "#6b7280";
  const setupOwed = (billing?.setupFee || 0) > 0 && !billing?.setupPaidAt;
  const monthlyActive = (billing?.monthlyFee || 0) > 0;

  return (
    <>
      {/* Status header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
        background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px",
        padding: "18px 20px", marginBottom: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <DollarSign size={16} color="#a78bfa" />
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>Billing Status</p>
            <p style={{ fontSize: "11px", color: colors.textMuted }}>
              {billing?.currency || "USD"} {billing?.setupFee || 0} setup · {billing?.currency || "USD"} {billing?.monthlyFee || 0}/mo
            </p>
          </div>
        </div>
        <span style={{
          fontSize: "12px", fontWeight: 700, padding: "5px 12px", borderRadius: "9999px",
          background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30`,
        }}>
          {BILLING_STATUS_LABEL[billing?.status] || "Trial"}
        </span>
      </div>

      {/* Admin: pricing editor */}
      {isAdmin && (
        <Section title="Set Pricing (admin only)" icon={DollarSign} colors={colors}>
          <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "16px" }}>
            Not shown publicly — priced per deal. The customer sees these amounts once set.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <div>
              {lbl("Setup Fee (one-time)")}
              <input type="number" min="0" value={pricingForm.setupFee}
                onChange={(e) => setPricingForm((f: any) => ({ ...f, setupFee: e.target.value }))} style={inp} />
            </div>
            <div>
              {lbl("Monthly Fee")}
              <input type="number" min="0" value={pricingForm.monthlyFee}
                onChange={(e) => setPricingForm((f: any) => ({ ...f, monthlyFee: e.target.value }))} style={inp} />
            </div>
            <div>
              {lbl("Currency")}
              <input value={pricingForm.currency}
                onChange={(e) => setPricingForm((f: any) => ({ ...f, currency: e.target.value }))} style={inp} placeholder="USD" />
            </div>
          </div>
          <div style={{ marginTop: "14px" }}>
            {lbl("Trial Ends")}
            <input type="date" value={pricingForm.trialEndsAt}
              onChange={(e) => setPricingForm((f: any) => ({ ...f, trialEndsAt: e.target.value }))} style={{ ...inp, maxWidth: "220px" }} />
          </div>
          <div style={{ marginTop: "14px" }}>
            {lbl("Internal Notes (deal terms, not shown to customer)")}
            <textarea rows={2} value={pricingForm.notes}
              onChange={(e) => setPricingForm((f: any) => ({ ...f, notes: e.target.value }))}
              style={{ ...inp, resize: "vertical" as const }} placeholder="e.g. Multi-location discount agreed via call on..." />
          </div>
          <SaveBtn onClick={savePricing} saving={pricingSaving} label="Save Pricing" />

          <div style={{ display: "flex", gap: "10px", marginTop: "18px", paddingTop: "18px", borderTop: `1px solid ${colors.border}` }}>
            <button onClick={() => confirmPayment("setup")} disabled={confirming === "setup" || !setupOwed} style={{
              flex: 1, padding: "10px", borderRadius: "8px", cursor: setupOwed ? "pointer" : "not-allowed",
              border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)",
              color: "#22c55e", fontSize: "12.5px", fontWeight: 600, opacity: setupOwed ? 1 : 0.5,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}>
              {confirming === "setup" ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle2 size={13} />}
              Confirm Setup Payment Received
            </button>
            <button onClick={() => confirmPayment("monthly")} disabled={confirming === "monthly" || !monthlyActive} style={{
              flex: 1, padding: "10px", borderRadius: "8px", cursor: monthlyActive ? "pointer" : "not-allowed",
              border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)",
              color: "#22c55e", fontSize: "12.5px", fontWeight: 600, opacity: monthlyActive ? 1 : 0.5,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}>
              {confirming === "monthly" ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle2 size={13} />}
              Confirm Monthly Payment Received
            </button>
          </div>
        </Section>
      )}

      {/* Payment due + pay instructions */}
      {(setupOwed || monthlyActive) && (
        <Section title="Payment" icon={Clock} colors={colors}>
          {notifySent ? (
            <div style={{
              padding: "24px", borderRadius: "10px", textAlign: "center",
              background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
            }}>
              <CheckCircle2 size={28} color="#22c55e" style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#22c55e", marginBottom: "4px" }}>Payment notification sent</p>
              <p style={{ fontSize: "12px", color: colors.textMuted }}>We'll verify and activate within 24 hours.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {setupOwed && (
                  <button onClick={() => setPayKind("setup")} style={{
                    flex: 1, padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
                    border: `2px solid ${payKind === "setup" ? "#7c3aed" : colors.border}`,
                    background: payKind === "setup" ? "rgba(124,58,237,0.08)" : "transparent",
                    color: payKind === "setup" ? "#a78bfa" : colors.text, fontSize: "12.5px", fontWeight: 600,
                  }}>
                    Setup Fee — {billing.currency} {billing.setupFee}
                  </button>
                )}
                {monthlyActive && (
                  <button onClick={() => setPayKind("monthly")} style={{
                    flex: 1, padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
                    border: `2px solid ${payKind === "monthly" ? "#7c3aed" : colors.border}`,
                    background: payKind === "monthly" ? "rgba(124,58,237,0.08)" : "transparent",
                    color: payKind === "monthly" ? "#a78bfa" : colors.text, fontSize: "12.5px", fontWeight: 600,
                  }}>
                    Monthly — {billing.currency} {billing.monthlyFee}
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                {Object.entries(BANK_DETAILS).map(([key, value]) => (
                  <div key={key} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "9px 12px", borderRadius: "7px", background: colors.bg, border: `1px solid ${colors.border}`,
                  }}>
                    <div>
                      <p style={{ fontSize: "10px", color: colors.textMuted, textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, " $1").trim()}</p>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text, fontFamily: "monospace" }}>{value}</p>
                    </div>
                    <button onClick={() => copyText(value, key)} style={{
                      width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer",
                      border: `1px solid ${colors.border}`, background: "transparent", color: colors.textMuted,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Copy size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  {lbl("Transaction Reference *")}
                  <input value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} style={inp} placeholder="e.g. TXN123456789" />
                </div>
                <div>
                  {lbl("Notes (optional)")}
                  <textarea rows={2} value={payNotes} onChange={(e) => setPayNotes(e.target.value)} style={{ ...inp, resize: "vertical" as const }} />
                </div>
                <button onClick={submitNotifyPayment} disabled={notifySending} style={{
                  padding: "11px", borderRadius: "9px", cursor: notifySending ? "not-allowed" : "pointer",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", border: "none",
                  fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  opacity: notifySending ? 0.7 : 1,
                }}>
                  <Mail size={14} />
                  {notifySending ? "Sending..." : "Notify us — I've paid"}
                </button>
              </div>
            </>
          )}
        </Section>
      )}

      {/* History */}
      <Section title="Billing History" icon={FileText} colors={colors}>
        {history.length === 0 ? (
          <p style={{ fontSize: "13px", color: colors.textMuted, textAlign: "center", padding: "20px" }}>No billing records yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {history.map((h) => (
              <div key={h._id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
                padding: "10px 14px", borderRadius: "8px", background: colors.bg, border: `1px solid ${colors.border}`,
              }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "13px", color: colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.description}</p>
                  <p style={{ fontSize: "11px", color: colors.textMuted }}>{new Date(h.billingDate).toLocaleDateString()}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: colors.text }}>{h.currency} {h.amount}</span>
                  <span style={{
                    fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px",
                    background: h.status === "paid" ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                    color: h.status === "paid" ? "#22c55e" : "#f59e0b",
                  }}>
                    {h.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
