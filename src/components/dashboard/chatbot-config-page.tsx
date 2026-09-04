"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

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
function Section({ title, icon: Icon, children, right }: {
  title: string; icon: any; children: React.ReactNode; right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-2.5 border-b px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Icon size={15} color="#a78bfa" />
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function SaveBtn({ onClick, saving, label = "Save Changes" }: { onClick: () => void; saving: boolean; label?: string }) {
  return (
    <div className="mt-2 flex justify-end">
      <Button onClick={onClick} disabled={saving} className="gap-2">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {saving ? "Saving..." : label}
      </Button>
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

const fieldLabel = (text: string) => <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{text}</Label>;

// ── OpenAI key gate dialog ───────────────────────────────────
// LogicMate is bring-your-own-key — a chatbot can't embed a knowledge base
// or answer a single message without its owner's own OpenAI key on file
// (no platform-wide fallback, see backend CLAUDE.md's BYOK section). Rather
// than let someone build out a whole bot and only discover that at chat
// time, this prompts for the key up front, before any setup work.
function AddOpenAiKeyDialog({ ownerId, forOtherUser, onClose, onSaved }: {
  ownerId: string; forOtherUser: boolean; onClose: () => void; onSaved: () => void;
}) {
  const [keyValue, setKeyValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!keyValue.trim()) { setError("Enter an OpenAI API key"); return; }
    setSaving(true); setError("");
    try {
      await api.post("/api-keys", {
        provider: "openai",
        label: "OpenAI",
        key: keyValue.trim(),
        userId: forOtherUser ? ownerId : undefined,
      });
      toast.success("OpenAI key saved");
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save key");
    }
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add an OpenAI API key</DialogTitle>
        </DialogHeader>
        <p className="-mt-2 text-xs leading-relaxed text-muted-foreground">
          {forOtherUser
            ? "This client needs their own OpenAI key on file before their chatbot can embed knowledge or reply — paste it here to add it to their account."
            : "Your chatbot needs an OpenAI key on file before it can embed its knowledge base or reply to customers."}
        </p>

        <div className="flex flex-col gap-3">
          <div>
            {fieldLabel("OpenAI API Key")}
            <Input
              type="password"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="sk-..."
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            />
          </div>
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-xs text-[#a78bfa]">
            Get an API key from OpenAI →
          </a>
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Not now</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : "Save Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main ──────────────────────────────────────────────────────
export function ChatbotConfigPage({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = (user as any)?.role === "admin";

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

  // OpenAI key gate — every chatbot capability (knowledge-base embedding,
  // the live chat engine itself) needs the bot OWNER's own OpenAI key on
  // file (BYOK, no platform fallback — see backend CLAUDE.md). Checked
  // right after the bot loads so the prompt appears before any setup work,
  // whether the viewer is the client themselves or an admin configuring a
  // client's bot on their behalf.
  const [openaiKeyMissing, setOpenaiKeyMissing] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);

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

  // Checks the bot OWNER's OpenAI key (not the viewer's — an admin viewing
  // a client's bot needs to know whether the client has one, not whether
  // the admin does). Passing ?userId= is a no-op for a non-admin viewing
  // their own bot since the backend only honors it for admins, so it's
  // always safe to pass the bot's userId here regardless of who's viewing.
  const checkOpenaiKey = async (ownerId: string) => {
    try {
      const res = await api.get(`/api-keys?userId=${ownerId}`);
      const keys = res.data?.data || res.data || [];
      const hasOpenAi = keys.some((k: any) => k.provider === "openai" && k.isActive !== false);
      setOpenaiKeyMissing(!hasOpenAi);
      setShowKeyDialog(!hasOpenAi);
    } catch {
      // Fail open — don't block setup over the check itself failing.
      setOpenaiKeyMissing(false);
    }
  };

  const fetchChatbot = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/chatbots/${id}`);
      const bot: Chatbot = res.data?.data || res.data;
      setChatbot(bot);
      checkOpenaiKey(bot.userId);
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
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change status");
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

  if (loading) {
    return (
      <div className="p-20 text-center">
        <Loader2 size={28} className="mx-auto animate-spin text-primary" />
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="p-20 text-center">
        <p className="text-sm text-muted-foreground">Chatbot not found.</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard/chatbots")}>
          Back to Chatbots
        </Button>
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
      <button onClick={() => router.push("/dashboard/chatbots")} className="mb-3.5 flex items-center gap-1.5 border-none bg-transparent p-0 text-[13px] text-muted-foreground">
        <ArrowLeft size={14} /> Back to Chatbots
      </button>

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground">{chatbot.name}</h1>
          <p className="text-[13px] text-muted-foreground">Configure, connect channels, and monitor this chatbot.</p>
        </div>
        <span
          className="rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ background: statusMeta[chatbot.status]?.bg, color: statusMeta[chatbot.status]?.color }}
        >
          {statusMeta[chatbot.status]?.label || chatbot.status}
        </span>
      </div>

      <ChatbotTrialBanner billing={chatbot.billing} onGoToBilling={() => setTab("billing")} />

      {/* Dismissed the OpenAI key dialog but it's still missing — keep a
          quiet reminder visible instead of just letting it disappear. */}
      {openaiKeyMissing && !showKeyDialog && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3">
          <p className="text-[13px] text-foreground">
            {isAdmin && chatbot.userId !== (user as any)?._id
              ? "This client hasn't added an OpenAI API key yet — the bot can't answer until they do."
              : "Add your OpenAI API key to power this chatbot's knowledge base and replies."}
          </p>
          <Button
            size="sm"
            onClick={() => setShowKeyDialog(true)}
            className="whitespace-nowrap bg-amber-500 text-[#1a1200] hover:bg-amber-500/90"
          >
            Add API Key
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-5 flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-lg border bg-card p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-md border-none px-4 py-1.5 text-[13px]",
              tab === key
                ? "bg-background font-semibold text-foreground shadow-sm"
                : "bg-transparent font-normal text-muted-foreground",
            )}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <>
          <Section title="Status" icon={Radio}>
            <div
              className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5 rounded-lg border px-4 py-3.5"
              style={{ background: statusMeta[chatbot.status]?.bg, borderColor: `${statusMeta[chatbot.status]?.color}30` }}
            >
              <p className="text-[13px] font-semibold text-foreground">{statusMeta[chatbot.status]?.desc}</p>
              {statusSaving && <Loader2 size={16} className="animate-spin" style={{ color: statusMeta[chatbot.status]?.color }} />}
            </div>
            <div className="flex gap-2">
              {(["draft", "active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={statusSaving}
                  className="flex-1 rounded-lg border-[1.5px] px-2.5 py-2.5 text-[13px] font-semibold disabled:cursor-not-allowed"
                  style={{
                    borderColor: chatbot.status === s ? statusMeta[s].color : "var(--border)",
                    background: chatbot.status === s ? statusMeta[s].bg : "var(--background)",
                    color: chatbot.status === s ? statusMeta[s].color : "var(--foreground)",
                  }}
                >
                  {statusMeta[s].label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Basic Info" icon={Settings}>
            <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-x-5">
              <div>
                {fieldLabel("Name")}
                <Input value={overview.name} onChange={(e) => setOverview((o) => ({ ...o, name: e.target.value }))} />
              </div>
              <div>
                {fieldLabel("Language")}
                <div className="flex gap-1.5">
                  {([
                    { value: "en", label: "English" },
                    { value: "ar", label: "Arabic" },
                    { value: "both", label: "Both" },
                  ] as const).map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setOverview((o) => ({ ...o, language: l.value }))}
                      className={cn(
                        "flex-1 rounded-lg border-[1.5px] px-2 py-2 text-xs font-semibold",
                        overview.language === l.value
                          ? "border-primary bg-primary/10 text-[#a78bfa]"
                          : "border-border bg-background text-foreground",
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mb-3.5">
              {fieldLabel("Description")}
              <Textarea value={overview.description} onChange={(e) => setOverview((o) => ({ ...o, description: e.target.value }))} rows={2} />
            </div>
            <div>
              {fieldLabel("Persona — how should the bot sound and behave?")}
              <Textarea value={overview.persona} onChange={(e) => setOverview((o) => ({ ...o, persona: e.target.value }))} rows={3}
                placeholder="e.g. Friendly, concise, always offers to book a call if the user seems unsure." />
            </div>
            <SaveBtn onClick={saveOverview} saving={overviewSaving} />
          </Section>

          <Section title="Fallback & Handoff" icon={AlertCircle}>
            <p className="mb-3.5 text-xs text-muted-foreground">
              Shown when the bot can't answer a question from its knowledge base.
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-x-5">
              <div>
                {fieldLabel("Fallback Message (English)")}
                <Textarea value={overview.fallbackMessage} onChange={(e) => setOverview((o) => ({ ...o, fallbackMessage: e.target.value }))} rows={2}
                  placeholder="Sorry, I don't have that information. Let me connect you with our team." />
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
                <Label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-500">
                  Fallback Message (Arabic)
                </Label>
                <Textarea value={overview.fallbackMessage_ar} onChange={(e) => setOverview((o) => ({ ...o, fallbackMessage_ar: e.target.value }))} rows={2}
                  dir="rtl" className="text-right" placeholder="عذراً، ما عندي هالمعلومة. راح أوصلك بفريقنا." />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-background px-4 py-3.5">
              <div>
                <p className="text-[13px] font-medium text-foreground">Human Handoff</p>
                <p className="text-[11px] text-muted-foreground">Escalate complex or unresolved queries to a human agent.</p>
              </div>
              <Switch checked={overview.humanHandoff} onCheckedChange={() => setOverview((o) => ({ ...o, humanHandoff: !o.humanHandoff }))} />
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
          refresh={fetchKnowledge}
        />
      )}

      {/* ── CHANNELS ── */}
      {tab === "channels" && (
        <ChannelsTab
          embedKey={chatbot.embedKey}
          channels={channels}
          setChannels={setChannels}
          savingChannel={savingChannel}
          saveChannel={saveChannel}
          embedCode={embedCode}
          embedLoading={embedLoading}
        />
      )}

      {/* ── CONVERSATIONS ── */}
      {tab === "conversations" && (
        <ConversationsTab
          conversations={conversations}
          loading={conversationsLoading}
          expandedConvo={expandedConvo}
          setExpandedConvo={setExpandedConvo}
        />
      )}

      {/* ── ANALYTICS ── */}
      {tab === "analytics" && (
        <AnalyticsTab analytics={analytics} loading={analyticsLoading} />
      )}

      {/* ── BILLING ── */}
      {tab === "billing" && (
        <BillingTab
          billing={chatbot.billing}
          history={billingHistory}
          loading={billingLoading}
          isAdmin={isAdmin}
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

      {showKeyDialog && (
        <AddOpenAiKeyDialog
          ownerId={chatbot.userId}
          forOtherUser={isAdmin && chatbot.userId !== (user as any)?._id}
          onClose={() => setShowKeyDialog(false)}
          onSaved={() => { setOpenaiKeyMissing(false); setShowKeyDialog(false); }}
        />
      )}
    </div>
  );
}

// ── Knowledge Tab ────────────────────────────────────────────
function KnowledgeTab({ botId, knowledge, loading, showAdd, setShowAdd, refresh }: {
  botId: string; knowledge: KnowledgeEntry[]; loading: boolean;
  showAdd: boolean; setShowAdd: (v: boolean) => void; refresh: () => void;
}) {
  const [type, setType] = useState<"faq" | "text" | "url">("faq");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeEntry | null>(null);

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

  const deleteEntry = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/chatbots/${botId}/knowledge/${deleteTarget._id}`);
      toast.success("Entry deleted");
      refresh();
    } catch {
      toast.error("Failed to delete entry");
    }
    setDeleteTarget(null);
  };

  const typeIcon: Record<string, any> = { faq: HelpCircle, text: FileText, url: Link2 };
  const typeColor: Record<string, string> = { faq: "#7c3aed", text: "#3b82f6", url: "#22c55e" };

  return (
    <Section
      title="Knowledge Base"
      icon={BookOpen}
      right={
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-1.5">
          {showAdd ? <X size={12} /> : <Plus size={12} />} {showAdd ? "Cancel" : "Add Knowledge"}
        </Button>
      }
    >
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        The bot only answers from what you add here — add your FAQs, policies, or paste website content.
      </p>

      {showAdd && (
        <div className="mb-4 rounded-lg border bg-background p-4">
          <div className="mb-3.5 flex gap-2">
            {([
              { value: "faq", label: "FAQ" },
              { value: "text", label: "Text" },
              { value: "url", label: "URL" },
            ] as const).map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className="flex-1 rounded-md border-[1.5px] p-2 text-xs font-semibold"
                style={{
                  borderColor: type === t.value ? typeColor[t.value] : "var(--border)",
                  background: type === t.value ? `${typeColor[t.value]}12` : "var(--card)",
                  color: type === t.value ? typeColor[t.value] : "var(--foreground)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {type === "faq" && (
            <div className="flex flex-col gap-2.5">
              <div>
                {fieldLabel("Question")}
                <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What are your opening hours?" />
              </div>
              <div>
                {fieldLabel("Answer")}
                <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={2} placeholder="We're open daily from 9am to 11pm." />
              </div>
            </div>
          )}

          {type === "text" && (
            <div>
              {fieldLabel("Content")}
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Paste your policy, product info, or any reference text..." />
            </div>
          )}

          {type === "url" && (
            <div>
              {fieldLabel("Source URL")}
              <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://example.com/faq" />
            </div>
          )}

          <div className="mt-3.5 flex justify-end">
            <Button onClick={addEntry} disabled={saving} className="gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {saving ? "Adding..." : "Add Entry"}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center">
          <Loader2 size={22} className="mx-auto animate-spin text-primary" />
        </div>
      ) : knowledge.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <BookOpen size={28} className="mx-auto mb-2.5 text-muted-foreground" />
          <p className="text-[13px] text-muted-foreground">No knowledge added yet. Add your first FAQ, text, or URL.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {knowledge.map((k) => {
            const Icon = typeIcon[k.type] || FileText;
            return (
              <div key={k._id} className="flex items-start gap-2.5 rounded-lg border bg-background p-3">
                <div
                  className="flex size-7 shrink-0 items-center justify-center rounded-md border"
                  style={{ background: `${typeColor[k.type]}12`, borderColor: `${typeColor[k.type]}25` }}
                >
                  <Icon size={13} color={typeColor[k.type]} />
                </div>
                <div className="min-w-0 flex-1">
                  {k.type === "faq" && (
                    <>
                      <p className="mb-0.5 text-[13px] font-semibold text-foreground">{k.question}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">{k.answer}</p>
                    </>
                  )}
                  {k.type === "text" && (
                    <p className="line-clamp-3 text-xs leading-relaxed text-foreground">
                      {k.content}
                    </p>
                  )}
                  {k.type === "url" && (
                    <a href={k.sourceUrl} target="_blank" rel="noreferrer" className="break-all text-xs text-[#a78bfa]">
                      {k.sourceUrl}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => setDeleteTarget(k)}
                  title="Delete"
                  className="flex size-6.5 shrink-0 items-center justify-center rounded-md border border-destructive/20 bg-destructive/[0.06] text-destructive"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this knowledge entry?</AlertDialogTitle>
            <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteEntry} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  );
}

// ── Channels Tab ─────────────────────────────────────────────
function ChannelsTab({ embedKey, channels, setChannels, savingChannel, saveChannel, embedCode, embedLoading }: {
  embedKey: string; channels: Channels; setChannels: (fn: (c: Channels) => Channels) => void;
  savingChannel: string | null; saveChannel: (key: "website" | "whatsapp" | "instagram") => void;
  embedCode: string; embedLoading: boolean;
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
  const whatsappWebhook = `${apiUrl}/webhooks/whatsapp/${embedKey}`;
  const instagramWebhook = `${apiUrl}/webhooks/instagram/${embedKey}`;

  return (
    <>
      {/* Website */}
      <Section
        title="Website Widget"
        icon={Globe}
        right={<Switch checked={!!channels.website.enabled} onCheckedChange={() => setChannels((c) => ({ ...c, website: { ...c.website, enabled: !c.website.enabled } }))} />}
      >
        <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-x-5">
          <div>
            {fieldLabel("Widget Color")}
            <input
              type="color"
              value={channels.website.customColor || "#7c3aed"}
              onChange={(e) => setChannels((c) => ({ ...c, website: { ...c.website, customColor: e.target.value } }))}
              className="h-[38px] w-full cursor-pointer rounded-lg border bg-background p-[3px]"
            />
          </div>
        </div>
        <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-x-5">
          <div>
            {fieldLabel("Welcome Message (English)")}
            <Textarea
              value={channels.website.welcomeMessage || ""}
              rows={2}
              onChange={(e) => setChannels((c) => ({ ...c, website: { ...c.website, welcomeMessage: e.target.value } }))}
              placeholder="Hi! How can I help you today?"
            />
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
            <Label className="mb-1.5 block text-xs font-medium text-amber-500">Welcome Message (Arabic)</Label>
            <Textarea
              value={channels.website.welcomeMessage_ar || ""}
              rows={2}
              dir="rtl"
              onChange={(e) => setChannels((c) => ({ ...c, website: { ...c.website, welcomeMessage_ar: e.target.value } }))}
              className="text-right"
              placeholder="هلا! كيف أقدر أساعدك اليوم؟"
            />
          </div>
        </div>

        {channels.website.enabled && (
          <div className="mb-3.5">
            {fieldLabel("Embed Code")}
            {embedLoading ? (
              <div className="p-4 text-center">
                <Loader2 size={16} className="animate-spin text-primary" />
              </div>
            ) : embedCode ? (
              <div className="relative">
                <pre className="m-0 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg border bg-background p-3.5 text-[11px] text-foreground">
                  {embedCode}
                </pre>
                <button
                  onClick={() => copyText(embedCode, "Embed code")}
                  className="absolute top-2 right-2 flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground"
                >
                  <Copy size={11} /> Copy
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Save with the website channel enabled to generate the embed code.</p>
            )}
          </div>
        )}

        <SaveBtn onClick={() => saveChannel("website")} saving={savingChannel === "website"} label="Save Website Channel" />
      </Section>

      {/* WhatsApp */}
      <Section
        title="WhatsApp"
        icon={FaWhatsapp}
        right={<Switch checked={!!channels.whatsapp.enabled} onCheckedChange={() => setChannels((c) => ({ ...c, whatsapp: { ...c.whatsapp, enabled: !c.whatsapp.enabled } }))} />}
      >
        <p className="mb-3.5 text-xs text-muted-foreground">
          Get these from your Meta Business App → WhatsApp → API Setup.
        </p>
        <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-x-5">
          <div>
            {fieldLabel("Phone Number ID")}
            <Input
              type="password"
              value={channels.whatsapp.phoneNumberId || ""}
              onChange={(e) => setChannels((c) => ({ ...c, whatsapp: { ...c.whatsapp, phoneNumberId: e.target.value } }))}
              placeholder="•••••••••••"
            />
          </div>
          <div>
            {fieldLabel("Access Token")}
            <Input
              type="password"
              value={channels.whatsapp.accessToken || ""}
              onChange={(e) => setChannels((c) => ({ ...c, whatsapp: { ...c.whatsapp, accessToken: e.target.value } }))}
              placeholder="•••••••••••"
            />
          </div>
        </div>
        <div className="mb-3.5">
          {fieldLabel("Webhook URL — paste this into Meta")}
          <div className="flex gap-2">
            <Input readOnly value={whatsappWebhook} className="cursor-text text-muted-foreground" />
            <Button variant="outline" onClick={() => copyText(whatsappWebhook, "Webhook URL")} className="shrink-0 gap-1.5">
              <Copy size={12} /> Copy
            </Button>
          </div>
        </div>
        <SaveBtn onClick={() => saveChannel("whatsapp")} saving={savingChannel === "whatsapp"} label="Save WhatsApp Channel" />
      </Section>

      {/* Instagram */}
      <Section
        title="Instagram"
        icon={FaInstagram}
        right={<Switch checked={!!channels.instagram.enabled} onCheckedChange={() => setChannels((c) => ({ ...c, instagram: { ...c.instagram, enabled: !c.instagram.enabled } }))} />}
      >
        <p className="mb-3.5 text-xs text-muted-foreground">
          Requires Meta App Review for the <code>instagram_manage_messages</code> permission.
        </p>
        <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-x-5">
          <div>
            {fieldLabel("Account ID")}
            <Input
              type="password"
              value={channels.instagram.accountId || ""}
              onChange={(e) => setChannels((c) => ({ ...c, instagram: { ...c.instagram, accountId: e.target.value } }))}
              placeholder="•••••••••••"
            />
          </div>
          <div>
            {fieldLabel("Access Token")}
            <Input
              type="password"
              value={channels.instagram.accessToken || ""}
              onChange={(e) => setChannels((c) => ({ ...c, instagram: { ...c.instagram, accessToken: e.target.value } }))}
              placeholder="•••••••••••"
            />
          </div>
        </div>
        <div className="mb-3.5">
          {fieldLabel("Webhook URL — paste this into Meta")}
          <div className="flex gap-2">
            <Input readOnly value={instagramWebhook} className="cursor-text text-muted-foreground" />
            <Button variant="outline" onClick={() => copyText(instagramWebhook, "Webhook URL")} className="shrink-0 gap-1.5">
              <Copy size={12} /> Copy
            </Button>
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

function ConversationsTab({ conversations, loading, expandedConvo, setExpandedConvo }: {
  conversations: Conversation[]; loading: boolean;
  expandedConvo: string | null; setExpandedConvo: (id: string | null) => void;
}) {
  const statusColor: Record<string, { color: string; bg: string }> = {
    active: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    closed: { color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
    handoff: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  };

  return (
    <Section title="Recent Conversations" icon={MessageSquare}>
      {loading ? (
        <div className="p-10 text-center">
          <Loader2 size={22} className="mx-auto animate-spin text-primary" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <MessageSquare size={28} className="mx-auto mb-2.5 text-muted-foreground" />
          <p className="text-[13px] text-muted-foreground">No conversations yet. They'll appear here once customers start chatting.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((c) => {
            const Icon = CHANNEL_ICON[c.channel] || Globe;
            const chColor = CHANNEL_COLOR[c.channel] || "#7c3aed";
            const sc = statusColor[c.status] || statusColor.closed;
            const lastMsg = c.messages?.[c.messages.length - 1];
            const isOpen = expandedConvo === c._id;
            return (
              <div key={c._id} className="overflow-hidden rounded-lg border">
                <div onClick={() => setExpandedConvo(isOpen ? null : c._id)} className="flex cursor-pointer items-center gap-2.5 bg-background px-3.5 py-3">
                  <div
                    className="flex size-7 shrink-0 items-center justify-center rounded-md border"
                    style={{ background: `${chColor}12`, borderColor: `${chColor}25` }}
                  >
                    <Icon size={13} color={chColor} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <p className="font-mono text-xs font-semibold text-foreground">
                        {c.sessionId?.slice(0, 12)}…
                      </p>
                      <span className="rounded-full px-1.75 py-0.5 text-[10px] font-semibold" style={{ background: sc.bg, color: sc.color }}>{c.status}</span>
                    </div>
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-foreground">
                      {lastMsg?.content || "No messages"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-muted-foreground">{c.messages?.length || 0} msgs</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  {isOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                </div>

                {isOpen && (
                  <div className="flex max-h-[360px] flex-col gap-2 overflow-auto bg-card p-3.5">
                    {(c.messages || []).map((m, i) => {
                      const isUser = m.role === "user";
                      return (
                        <div key={i} className={cn("flex gap-2", isUser ? "justify-start" : "justify-end")}>
                          {isUser && (
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-background">
                              <UserIcon size={12} className="text-muted-foreground" />
                            </div>
                          )}
                          <div
                            className={cn(
                              "max-w-[70%] rounded-lg border px-3 py-2 text-xs leading-relaxed text-foreground",
                              isUser ? "border-border bg-background" : "border-primary/25 bg-primary/[0.12]",
                            )}
                          >
                            {m.content}
                            <p className="mt-1 text-[9px] text-muted-foreground">
                              {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ""}
                            </p>
                          </div>
                          {!isUser && (
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/15">
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
function AnalyticsTab({ analytics, loading }: { analytics: Analytics | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="p-15 text-center">
        <Loader2 size={22} className="mx-auto animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <BarChart3 size={28} className="mx-auto mb-2.5 text-muted-foreground" />
        <p className="text-[13px] text-muted-foreground">No analytics available yet.</p>
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
      <div className="mb-4 grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4.5">
            <p className="mb-1 text-2xl font-extrabold" style={{ color: s.color }}>{s.value ?? 0}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <Section title="Conversations by Channel" icon={BarChart3}>
        <div className="flex flex-col gap-3.5">
          {channelRows.map((r) => {
            const Icon = r.icon;
            const pct = Math.round((r.value / maxChannel) * 100);
            return (
              <div key={r.key}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={14} color={r.color} />
                    <span className="text-[13px] font-medium text-foreground">{r.label}</span>
                  </div>
                  <span className="text-[13px] font-bold text-foreground">{r.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full border bg-background">
                  <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: r.color }} />
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
  billing, history, loading, isAdmin,
  pricingForm, setPricingForm, savePricing, pricingSaving,
  payKind, setPayKind, transactionRef, setTransactionRef, payNotes, setPayNotes,
  notifySending, notifySent, submitNotifyPayment,
  confirming, confirmPayment,
}: {
  billing: Billing; history: BillingRecord[]; loading: boolean; isAdmin: boolean;
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
      <div className="p-15 text-center">
        <Loader2 size={22} className="mx-auto animate-spin text-primary" />
      </div>
    );
  }

  const statusColor = BILLING_STATUS_COLOR[billing?.status] || "#6b7280";
  const setupOwed = (billing?.setupFee || 0) > 0 && !billing?.setupPaidAt;
  const monthlyActive = (billing?.monthlyFee || 0) > 0;

  return (
    <>
      {/* Status header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-5 py-4.5">
        <div className="flex items-center gap-2.5">
          <DollarSign size={16} color="#a78bfa" />
          <div>
            <p className="text-sm font-semibold text-foreground">Billing Status</p>
            <p className="text-[11px] text-muted-foreground">
              {billing?.currency || "USD"} {billing?.setupFee || 0} setup · {billing?.currency || "USD"} {billing?.monthlyFee || 0}/mo
            </p>
          </div>
        </div>
        <span
          className="rounded-full border px-3 py-1.5 text-xs font-bold"
          style={{ background: `${statusColor}18`, color: statusColor, borderColor: `${statusColor}30` }}
        >
          {BILLING_STATUS_LABEL[billing?.status] || "Trial"}
        </span>
      </div>

      {/* Admin: pricing editor */}
      {isAdmin && (
        <Section title="Set Pricing (admin only)" icon={DollarSign}>
          <p className="mb-4 text-xs text-muted-foreground">
            Not shown publicly — priced per deal. The customer sees these amounts once set.
          </p>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <div>
              {fieldLabel("Setup Fee (one-time)")}
              <Input type="number" min="0" value={pricingForm.setupFee}
                onChange={(e) => setPricingForm((f: any) => ({ ...f, setupFee: e.target.value }))} />
            </div>
            <div>
              {fieldLabel("Monthly Fee")}
              <Input type="number" min="0" value={pricingForm.monthlyFee}
                onChange={(e) => setPricingForm((f: any) => ({ ...f, monthlyFee: e.target.value }))} />
            </div>
            <div>
              {fieldLabel("Currency")}
              <Input value={pricingForm.currency}
                onChange={(e) => setPricingForm((f: any) => ({ ...f, currency: e.target.value }))} placeholder="USD" />
            </div>
          </div>
          <div className="mt-3.5">
            {fieldLabel("Trial Ends")}
            <Input type="date" value={pricingForm.trialEndsAt}
              onChange={(e) => setPricingForm((f: any) => ({ ...f, trialEndsAt: e.target.value }))} className="max-w-[220px]" />
          </div>
          <div className="mt-3.5">
            {fieldLabel("Internal Notes (deal terms, not shown to customer)")}
            <Textarea rows={2} value={pricingForm.notes}
              onChange={(e) => setPricingForm((f: any) => ({ ...f, notes: e.target.value }))}
              placeholder="e.g. Multi-location discount agreed via call on..." />
          </div>
          <SaveBtn onClick={savePricing} saving={pricingSaving} label="Save Pricing" />

          <div className="mt-4.5 flex flex-col gap-2.5 border-t pt-4.5 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => confirmPayment("setup")}
              disabled={confirming === "setup" || !setupOwed}
              className="flex-1 gap-1.5 whitespace-normal border-[#22c55e]/30 bg-[#22c55e]/[0.08] text-[#22c55e] hover:bg-[#22c55e]/[0.15] hover:text-[#22c55e]"
            >
              {confirming === "setup" ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              Confirm Setup Payment Received
            </Button>
            <Button
              variant="outline"
              onClick={() => confirmPayment("monthly")}
              disabled={confirming === "monthly" || !monthlyActive}
              className="flex-1 gap-1.5 whitespace-normal border-[#22c55e]/30 bg-[#22c55e]/[0.08] text-[#22c55e] hover:bg-[#22c55e]/[0.15] hover:text-[#22c55e]"
            >
              {confirming === "monthly" ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              Confirm Monthly Payment Received
            </Button>
          </div>
        </Section>
      )}

      {/* Payment due + pay instructions */}
      {(setupOwed || monthlyActive) && (
        <Section title="Payment" icon={Clock}>
          {notifySent ? (
            <div className="rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/[0.08] p-6 text-center">
              <CheckCircle2 size={28} className="mx-auto mb-2.5 text-[#22c55e]" />
              <p className="mb-1 text-sm font-semibold text-[#22c55e]">Payment notification sent</p>
              <p className="text-xs text-muted-foreground">We'll verify and activate within 24 hours.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex gap-2">
                {setupOwed && (
                  <button
                    onClick={() => setPayKind("setup")}
                    className={cn(
                      "flex-1 rounded-lg border-2 px-3 py-2 text-[12.5px] font-semibold",
                      payKind === "setup" ? "border-primary bg-primary/[0.08] text-[#a78bfa]" : "border-border bg-transparent text-foreground",
                    )}
                  >
                    Setup Fee — {billing.currency} {billing.setupFee}
                  </button>
                )}
                {monthlyActive && (
                  <button
                    onClick={() => setPayKind("monthly")}
                    className={cn(
                      "flex-1 rounded-lg border-2 px-3 py-2 text-[12.5px] font-semibold",
                      payKind === "monthly" ? "border-primary bg-primary/[0.08] text-[#a78bfa]" : "border-border bg-transparent text-foreground",
                    )}
                  >
                    Monthly — {billing.currency} {billing.monthlyFee}
                  </button>
                )}
              </div>

              <div className="mb-4 flex flex-col gap-2">
                {Object.entries(BANK_DETAILS).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between rounded-md border bg-background px-3 py-2.25">
                    <div>
                      <p className="text-[10px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                      <p className="font-mono text-[13px] font-semibold text-foreground">{value}</p>
                    </div>
                    <button onClick={() => copyText(value, key)} className="flex size-7 items-center justify-center rounded-md border text-muted-foreground">
                      <Copy size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2.5">
                <div>
                  {fieldLabel("Transaction Reference *")}
                  <Input value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} placeholder="e.g. TXN123456789" />
                </div>
                <div>
                  {fieldLabel("Notes (optional)")}
                  <Textarea rows={2} value={payNotes} onChange={(e) => setPayNotes(e.target.value)} />
                </div>
                <Button onClick={submitNotifyPayment} disabled={notifySending} className="gap-2">
                  <Mail size={14} />
                  {notifySending ? "Sending..." : "Notify us — I've paid"}
                </Button>
              </div>
            </>
          )}
        </Section>
      )}

      {/* History */}
      <Section title="Billing History" icon={FileText}>
        {history.length === 0 ? (
          <p className="p-5 text-center text-[13px] text-muted-foreground">No billing records yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((h) => (
              <div key={h._id} className="flex items-center justify-between gap-2.5 rounded-lg border bg-background px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-foreground">{h.description}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(h.billingDate).toLocaleDateString()}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[13px] font-bold text-foreground">{h.currency} {h.amount}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      background: h.status === "paid" ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                      color: h.status === "paid" ? "#22c55e" : "#f59e0b",
                    }}
                  >
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
