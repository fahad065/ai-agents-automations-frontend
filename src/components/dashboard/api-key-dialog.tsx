"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import {
  SiOpenai, SiAnthropic, SiGooglegemini, SiYoutube, SiElevenlabs, SiOllama,
} from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";

// Real provider brand marks (react-icons/si — Simple Icons), not emoji —
// OpenAI/ElevenLabs/Ollama render monochrome via currentColor (their own
// logos are black/white and should adapt to light/dark mode); Anthropic/
// Gemini/YouTube are genuinely colored brand marks, so those get their
// real brand hex regardless of theme. Atlas Cloud has no tracked Simple
// Icons entry — 🎬 stays an emoji placeholder for that one only.
export const PROVIDERS = [
  { provider: "atlas_seedance", label: "Atlas Cloud - Seedance", description: "AI video clip generation via Seedance v1.5 Pro", icon: <span className="text-sm">🎬</span>, color: "#7c3aed", required: true, helpUrl: "https://atlascloud.ai", placeholder: "sk-atlas-..." },
  { provider: "openai", label: "OpenAI", description: "TTS voiceover generation (onyx voice), chatbot replies and knowledge-base embeddings", icon: <SiOpenai className="size-4" />, color: "#10a37f", required: true, helpUrl: "https://platform.openai.com/api-keys", placeholder: "sk-..." },
  { provider: "anthropic", label: "Anthropic (Claude)", description: "Alternate chatbot provider — pick it on your bot's Overview tab", icon: <SiAnthropic className="size-4" style={{ color: "#D97757" }} />, color: "#d97757", required: false, helpUrl: "https://console.anthropic.com/settings/keys", placeholder: "sk-ant-..." },
  { provider: "gemini", label: "Google Gemini", description: "Alternate chatbot provider — pick it on your bot's Overview tab", icon: <SiGooglegemini className="size-4" style={{ color: "#4285F4" }} />, color: "#4285f4", required: false, helpUrl: "https://aistudio.google.com/apikey", placeholder: "AIza..." },
  { provider: "youtube_oauth", label: "YouTube OAuth", description: "Upload and schedule videos to your YouTube channel", icon: <SiYoutube className="size-4" style={{ color: "#FF0000" }} />, color: "#ff0000", required: true, helpUrl: "https://console.cloud.google.com", placeholder: "OAuth credentials JSON or token" },
  { provider: "youtube_data", label: "YouTube Data API", description: "Trend discovery and video analytics", icon: <SiYoutube className="size-4" style={{ color: "#FF0000" }} />, color: "#ff0000", required: false, helpUrl: "https://console.cloud.google.com", placeholder: "AIza..." },
  { provider: "elevenlabs", label: "ElevenLabs", description: "Premium TTS fallback voice generation", icon: <SiElevenlabs className="size-4" />, color: "#3b82f6", required: false, helpUrl: "https://elevenlabs.io", placeholder: "el-..." },
  { provider: "ollama", label: "Ollama", description: "Local LLM host URL (default: http://localhost:11434)", icon: <SiOllama className="size-4" />, color: "#a78bfa", required: false, helpUrl: "https://ollama.ai", placeholder: "http://localhost:11434" },
];

export const PROVIDER_OPTIONS: ComboboxOption[] = PROVIDERS.map((p) => ({
  value: p.provider,
  label: p.label + (p.required ? " (required)" : ""),
  icon: p.icon,
}));

// ─── Add / Edit Key Dialog ────────────────────────────────────
// The one API key form in the app: the API Keys page and the chatbot
// setup prompt ("your bot needs a key") both use it, so they always look
// and behave the same.

export function ApiKeyDialog({
  open, onClose, onSaved, existingKey, defaultProvider, ownerId, notice, cancelLabel = "Cancel",
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  existingKey?: { provider: string; label: string } | null;
  /** Preselect this provider (e.g. the chatbot's AI provider). */
  defaultProvider?: string;
  /** Admin saving a key on a client's account. */
  ownerId?: string;
  /** Extra line under the description, e.g. why the key is needed. */
  notice?: string;
  cancelLabel?: string;
}) {
  const [provider, setProvider] = useState("");
  const [label, setLabel] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (existingKey) {
        setProvider(existingKey.provider);
        setLabel(existingKey.label);
      } else {
        const start = PROVIDERS.find((p) => p.provider === defaultProvider) || PROVIDERS[0];
        setProvider(defaultProvider || start.provider);
        setLabel(start.provider === defaultProvider || !defaultProvider ? start.label : defaultProvider);
      }
      setKeyValue("");
      setError("");
      setShowKey(false);
    }
  }, [open, existingKey, defaultProvider]);

  const selectedProvider = PROVIDERS.find((p) => p.provider === provider);

  // Covers both a known-provider pick and typing a brand-new one via the
  // Combobox's "Add ..." row — either way, auto-fills Name the same way:
  // the provider's nice label if known, the raw typed text otherwise.
  const handleProviderChange = (p: string) => {
    setProvider(p);
    const pInfo = PROVIDERS.find((x) => x.provider === p);
    if (!existingKey) setLabel(pInfo ? pInfo.label : p);
  };

  const handleSave = async () => {
    if (!provider || !keyValue.trim()) {
      setError("Provider and key value are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post("/api-keys", {
        provider,
        label: label || selectedProvider?.label || provider,
        key: keyValue.trim(),
        ...(ownerId ? { userId: ownerId } : {}),
      });
      toast.success(existingKey ? "API key updated" : "API key added");
      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to save key";
      setError(msg);
      toast.error(msg);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{existingKey ? "Update API key" : "Create API key"}</DialogTitle>
          <DialogDescription>Stored encrypted with AES-256. Raw values are never shown again.</DialogDescription>
        </DialogHeader>
        {notice && (
          <p className="-mt-1 rounded-lg border border-amber-500/25 bg-amber-500/[0.08] px-3 py-2.5 text-xs leading-relaxed text-foreground">{notice}</p>
        )}

        <div className="flex flex-col gap-4">
          {!existingKey && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="key-provider">Service / Provider</Label>
              <Combobox
                id="key-provider"
                value={provider}
                onChange={handleProviderChange}
                options={PROVIDER_OPTIONS}
                creatable
                createRowLabel="🔑 Other — add a new provider"
                createInputPlaceholder="e.g. Stripe, Twilio, SendGrid"
                placeholder="Select a provider..."
                searchPlaceholder="Search providers..."
                emptyText="No matching provider."
              />
              {selectedProvider?.description ? (
                <p className="text-xs text-muted-foreground">{selectedProvider.description}</p>
              ) : provider ? (
                <p className="text-xs text-muted-foreground">
                  New provider — not in the preset list, saved exactly as typed.
                </p>
              ) : null}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="key-label">Name</Label>
            <Input id="key-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={selectedProvider?.label || "My API Key"} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="key-value">{existingKey ? "New key value" : "API key value"}</Label>
              {selectedProvider?.helpUrl && (
                <a href={selectedProvider.helpUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                  Get key →
                </a>
              )}
            </div>
            <div className="relative">
              <Input
                id="key-value"
                type={showKey ? "text" : "password"}
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                placeholder={selectedProvider?.placeholder || "Paste your key here"}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/[0.06] px-3 py-2.5">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Your key is encrypted with AES-256 before storage.
            </p>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{cancelLabel}</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : existingKey ? "Update key" : "Save key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

