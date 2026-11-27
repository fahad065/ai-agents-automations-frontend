"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Plus, Loader2, Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

// Admin builds a chatbot for a client (or themselves) from Customer
// Services. Customers subscribe from Browse Services instead.

interface AdminUserOption {
  _id: string;
  name: string;
  email: string;
}

export const TEMPLATES: { key: string; emoji: string; name: string }[] = [
  { key: "restaurant", emoji: "🍽️", name: "Restaurant" },
  { key: "real_estate", emoji: "🏠", name: "Real Estate" },
  { key: "clinic", emoji: "🩺", name: "Clinic" },
  { key: "gym", emoji: "🏋️", name: "Gym" },
  { key: "salon", emoji: "💇", name: "Salon / Spa" },
  { key: "hotel", emoji: "🏨", name: "Hotel / Travel" },
  { key: "auto_dealership", emoji: "🚗", name: "Auto Dealership" },
  { key: "home_services", emoji: "🛠️", name: "Home Services" },
];

// ── Create Chatbot Modal ────────────────────────────────────────
export function CreateChatbotModal({ onClose, onCreated, isAdmin }: {
  onClose: () => void; onCreated: (id: string) => void; isAdmin: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState<string>("");
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
    if (!template) { setError("Choose which chatbot service this is"); return; }
    setSaving(true); setError("");
    try {
      const res = await api.post("/chatbots", {
        name: name.trim(),
        description: description.trim() || undefined,
        language,
        template,
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
              <Combobox
                value={clientId}
                onChange={setClientId}
                options={[
                  { value: "", label: "Myself (admin account)" },
                  ...clients.map((c) => ({ value: c._id, label: `${c.name || "Unnamed"} — ${c.email}` })),
                ]}
                searchPlaceholder="Search clients..."
              />
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
            <Label className="mb-1.5 text-xs font-medium text-muted-foreground">Chatbot service *</Label>
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

