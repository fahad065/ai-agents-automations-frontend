"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import {
  Bot, Plus, Trash2, Loader2, Globe, Settings2, Check, User, Mail,
} from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────
interface Chatbot {
  _id: string;
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
  channels?: {
    website?: { enabled?: boolean };
    whatsapp?: { enabled?: boolean };
    instagram?: { enabled?: boolean };
  };
  createdAt: string;
  updatedAt?: string;
  // Only present when fetched via GET /chatbots/admin/all — the backend
  // populates the userId field itself with {_id, name, email} rather than
  // adding a separate field, so this is the same "userId" key, just an
  // object instead of a string when the admin listing is used.
  userId?: string | { _id: string; name: string; email: string };
}

interface AdminUserOption {
  _id: string;
  name: string;
  email: string;
}

const STATUS_CONFIG: Record<string, { className: string; label: string }> = {
  active: { className: "bg-[#22c55e]/10 text-[#22c55e]", label: "Active" },
  draft: { className: "bg-[#f59e0b]/10 text-[#f59e0b]", label: "Draft" },
  inactive: { className: "bg-secondary text-muted-foreground", label: "Paused" },
};

interface Template {
  key: string;
  emoji: string;
  name: string;
}

const TEMPLATES: Template[] = [
  { key: "restaurant", emoji: "🍽️", name: "Restaurant" },
  { key: "real_estate", emoji: "🏠", name: "Real Estate" },
  { key: "clinic", emoji: "💆", name: "Clinic" },
  { key: "ecommerce", emoji: "🛍️", name: "E-commerce" },
  { key: "gym", emoji: "🏋️", name: "Gym" },
  { key: "education", emoji: "🎓", name: "Education" },
  { key: "salon", emoji: "💇", name: "Salon / Spa" },
  { key: "hotel", emoji: "🏨", name: "Hotel / Travel" },
  { key: "auto_dealership", emoji: "🚗", name: "Auto Dealership" },
  { key: "custom", emoji: "✨", name: "Custom / Blank" },
];

const TEMPLATE_EMOJI: Record<string, string> = TEMPLATES.reduce((acc, t) => {
  acc[t.key] = t.emoji;
  return acc;
}, {} as Record<string, string>);

// ── Create Chatbot Modal ────────────────────────────────────────
function CreateChatbotModal({ onClose, onCreated, isAdmin }: {
  onClose: () => void; onCreated: (id: string) => void; isAdmin: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState<string>("custom");
  const [language, setLanguage] = useState<"en" | "ar" | "both">("en");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Set once creation succeeds — swaps the modal to a brief "check your
  // email" confirmation (a real setup-guide email is sent server-side on
  // create, see backend CLAUDE.md) before handing off to onCreated(), so the
  // redirect into the config page doesn't happen so fast that this notice
  // gets missed entirely.
  const [createdId, setCreatedId] = useState<string | null>(null);

  // Admin-only: build this bot under a specific client's account instead of
  // their own — the "close the deal, build it for them" onboarding flow.
  // Left unselected, it creates under the admin's own account same as before.
  const [clients, setClients] = useState<AdminUserOption[]>([]);
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    api.get("/admin/users").then((res: any) => {
      setClients(res.data || []);
    }).catch(() => {});
  }, [isAdmin]);

  const handleCreate = async () => {
    if (!name.trim()) { setError("Chatbot name is required"); return; }
    setSaving(true); setError("");
    try {
      const res = await api.post("/chatbots", {
        name: name.trim(),
        description: description.trim() || undefined,
        language,
        template: template !== "custom" ? template : undefined,
        userId: isAdmin && clientId ? clientId : undefined,
      });
      const created = res.data?.data || res.data;
      toast.success("Chatbot created!");
      setCreatedId(created._id);
      setTimeout(() => onCreated(created._id), 5000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create chatbot");
    }
    setSaving(false);
  };

  if (createdId) {
    return (
      <Dialog open onOpenChange={(open) => !open && onCreated(createdId)}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Mail size={26} className="text-primary" />
            </div>
            <h2 className="mb-1.5 text-base font-semibold text-foreground">Check your email for setup guidance</h2>
            <p className="mb-5 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              We've sent a quick setup guide to your inbox — what to fill in yourself, and what our team handles for you. You can also find it anytime under the <strong className="text-foreground">Guide to Setup</strong> tab.
            </p>
            <Button onClick={() => onCreated(createdId)} className="gap-2">
              <Loader2 size={14} className="animate-spin" /> Taking you to your chatbot...
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Chatbot</DialogTitle>
          <p className="text-xs text-muted-foreground">Pick a template and give it a name</p>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-auto">
          {isAdmin && (
            <div>
              <Label className="mb-1.5 text-xs font-medium text-muted-foreground">Build for</Label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="h-8 w-full cursor-pointer rounded-lg border bg-background px-3 text-[13px] text-foreground outline-none"
              >
                <option value="">Myself (admin account)</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>{c.name || "Unnamed"} — {c.email}</option>
                ))}
              </select>
              <p className="mt-1.25 text-[11px] text-muted-foreground">
                Pick a client to build and configure this bot under their account — they'll see it in their own dashboard right away.
              </p>
            </div>
          )}

          <div>
            <Label className="mb-1.5 text-xs font-medium text-muted-foreground">Chatbot Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunset Cafe Assistant" />
          </div>

          <div>
            <Label className="mb-1.5 text-xs font-medium text-muted-foreground">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What does this bot do for your business?" />
          </div>

          <div>
            <Label className="mb-1.5 text-xs font-medium text-muted-foreground">Template</Label>
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
              {TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTemplate(t.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-[9px] border-[1.5px] px-3 py-2.5 text-left",
                    template === t.key ? "border-primary bg-primary/10" : "bg-background"
                  )}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <span className={cn("text-xs font-semibold", template === t.key ? "text-[#a78bfa]" : "text-foreground")}>{t.name}</span>
                  {template === t.key && <Check size={12} className="ml-auto text-[#a78bfa]" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-1.5 text-xs font-medium text-muted-foreground">Language</Label>
            <div className="flex gap-2">
              {([
                { value: "en", label: "English" },
                { value: "ar", label: "Arabic" },
                { value: "both", label: "Both" },
              ] as const).map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLanguage(l.value)}
                  className={cn(
                    "flex-1 rounded-lg border-[1.5px] py-2.25 text-[13px] font-semibold",
                    language === l.value ? "border-primary bg-primary/10 text-[#a78bfa]" : "bg-background text-foreground"
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/8 px-3 py-2 text-xs text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleCreate} disabled={saving} className="flex-2 gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {saving ? "Creating..." : "Create Chatbot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export function ChatbotsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = (user as any)?.role === "admin";
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Chatbot | null>(null);

  useEffect(() => { fetchChatbots(); }, [isAdmin]);

  // Admin sees every client's chatbot (so they can open and configure any of
  // them — see admin bypass in ChatbotsService), not just their own.
  const fetchChatbots = async () => {
    setLoading(true);
    try {
      const res = await api.get(isAdmin ? "/chatbots/admin/all" : "/chatbots");
      setChatbots(res.data?.data || res.data || []);
    } catch {
      toast.error("Failed to load chatbots");
    }
    setLoading(false);
  };

  const deleteChatbot = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/chatbots/${deleteTarget._id}`);
      toast.success("Chatbot deleted");
      fetchChatbots();
    } catch {
      toast.error("Failed to delete chatbot");
    }
    setDeleteTarget(null);
  };

  const handleCreated = (id: string) => {
    setShowCreate(false);
    router.push(`/dashboard/chatbots/${id}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground">Chatbots</h1>
          <p className="text-sm text-muted-foreground">Build and deploy AI chatbots on your website, WhatsApp, and Instagram.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus size={15} /> New Chatbot
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-15 text-center">
          <Loader2 size={28} className="mx-auto animate-spin text-primary" />
        </div>
      ) : chatbots.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-15 text-center">
          <Bot size={40} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="mb-2 text-base font-semibold text-foreground">No chatbots yet</h2>
          <p className="mb-5 text-sm text-muted-foreground">Create your first chatbot to start answering customers 24/7.</p>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus size={15} /> Create your first chatbot
          </Button>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {chatbots.map((bot) => {
            const sc = STATUS_CONFIG[bot.status] || STATUS_CONFIG.draft;
            const emoji = (bot.template && TEMPLATE_EMOJI[bot.template]) || "🤖";
            const channels = bot.channels || {};
            return (
              <div key={bot._id} className="rounded-xl border bg-card p-4.5">
                {/* Card header */}
                <div className="mb-2.5 flex items-start justify-between">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-primary/20 bg-primary/12 text-xl">
                      {emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap text-foreground">{bot.name}</p>
                      <p className="overflow-hidden text-[11px] text-ellipsis whitespace-nowrap text-muted-foreground">
                        {isAdmin && bot.userId && typeof bot.userId === "object" ? (
                          <span className="inline-flex items-center gap-1">
                            <User size={10} /> {bot.userId.name || bot.userId.email}
                          </span>
                        ) : (
                          new Date(bot.createdAt).toLocaleDateString()
                        )}
                      </p>
                    </div>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.75 text-[10px] font-semibold", sc.className)}>
                    {sc.label}
                  </span>
                </div>

                {/* Description */}
                <p className="mb-3.5 line-clamp-2 min-h-[18px] text-xs leading-relaxed text-muted-foreground">
                  {bot.description || "No description added yet."}
                </p>

                {/* Channels row */}
                <div className="mb-3.5 flex gap-1.5">
                  {[
                    { key: "website", icon: Globe, color: "#7c3aed", enabled: !!channels.website?.enabled },
                    { key: "whatsapp", icon: FaWhatsapp, color: "#22c55e", enabled: !!channels.whatsapp?.enabled },
                    { key: "instagram", icon: FaInstagram, color: "#e1306c", enabled: !!channels.instagram?.enabled },
                  ].map((ch) => {
                    const Icon = ch.icon;
                    return (
                      <div
                        key={ch.key}
                        title={`${ch.key}${ch.enabled ? " enabled" : " disabled"}`}
                        className={cn("flex flex-1 items-center justify-center rounded-md border p-1.5", !ch.enabled && "opacity-40")}
                        style={ch.enabled ? { background: `${ch.color}12`, borderColor: `${ch.color}30` } : undefined}
                      >
                        <Icon size={13} color={ch.enabled ? ch.color : undefined} className={!ch.enabled ? "text-muted-foreground" : undefined} />
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-1.5">
                  <Button onClick={() => router.push(`/dashboard/chatbots/${bot._id}`)} className="flex-1 gap-1.5 text-xs">
                    <Settings2 size={13} /> Configure
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeleteTarget(bot)}
                    title="Delete"
                    className="border-destructive/20 bg-destructive/6 text-destructive"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateChatbotModal onClose={() => setShowCreate(false)} onCreated={handleCreated} isAdmin={isAdmin} />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chatbot?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && `"${deleteTarget.name}" will be permanently deleted. This can't be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteChatbot} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
