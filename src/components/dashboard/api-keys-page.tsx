"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Plus, Search, ListFilter, MoreHorizontal, Key, ShieldCheck,
  RefreshCw, Pencil, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface ApiKey {
  _id: string;
  provider: string;
  label: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const PROVIDERS = [
  { provider: "atlas_seedance", label: "Atlas Cloud - Seedance", description: "AI video clip generation via Seedance v1.5 Pro", icon: "🎬", color: "#7c3aed", required: true, helpUrl: "https://atlascloud.ai", placeholder: "sk-atlas-..." },
  { provider: "openai", label: "OpenAI", description: "TTS voiceover generation (onyx voice)", icon: "🎙️", color: "#22c55e", required: true, helpUrl: "https://platform.openai.com/api-keys", placeholder: "sk-..." },
  { provider: "youtube_oauth", label: "YouTube OAuth", description: "Upload and schedule videos to your YouTube channel", icon: "📺", color: "#ef4444", required: true, helpUrl: "https://console.cloud.google.com", placeholder: "OAuth credentials JSON or token" },
  { provider: "youtube_data", label: "YouTube Data API", description: "Trend discovery and video analytics", icon: "📊", color: "#f59e0b", required: false, helpUrl: "https://console.cloud.google.com", placeholder: "AIza..." },
  { provider: "elevenlabs", label: "ElevenLabs", description: "Premium TTS fallback voice generation", icon: "🔊", color: "#3b82f6", required: false, helpUrl: "https://elevenlabs.io", placeholder: "el-..." },
  { provider: "ollama", label: "Ollama", description: "Local LLM host URL (default: http://localhost:11434)", icon: "🧠", color: "#a78bfa", required: false, helpUrl: "https://ollama.ai", placeholder: "http://localhost:11434" },
];

const PAGE_SIZE = 6;

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Add / Edit Key Dialog ────────────────────────────────────

function KeyDialog({ open, onClose, onSaved, existingKey }: {
  open: boolean; onClose: () => void; onSaved: () => void; existingKey?: ApiKey | null;
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
        setProvider(PROVIDERS[0].provider);
        setLabel(PROVIDERS[0].label);
      }
      setKeyValue("");
      setError("");
      setShowKey(false);
    }
  }, [open, existingKey]);

  const selectedProvider = PROVIDERS.find((p) => p.provider === provider);

  const handleProviderChange = (p: string) => {
    setProvider(p);
    const pInfo = PROVIDERS.find((x) => x.provider === p);
    if (pInfo && !existingKey) setLabel(pInfo.label);
  };

  const handleSave = async () => {
    if (!provider || !keyValue.trim()) {
      setError("Provider and key value are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post("/api-keys", { provider, label: label || selectedProvider?.label || provider, key: keyValue.trim() });
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

        <div className="flex flex-col gap-4">
          {!existingKey && (
            <div className="flex flex-col gap-2">
              <Label>Service / Provider</Label>
              <div className="grid grid-cols-2 gap-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.provider}
                    type="button"
                    onClick={() => handleProviderChange(p.provider)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                      provider === p.provider ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                    }`}
                  >
                    <span className="text-base">{p.icon}</span>
                    <span className="min-w-0">
                      <span className={`block truncate text-xs font-semibold ${provider === p.provider ? "text-primary" : "text-foreground"}`}>
                        {p.label}
                      </span>
                      {p.required && <span className="text-[10px] text-destructive">Required</span>}
                    </span>
                  </button>
                ))}
              </div>
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
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : existingKey ? "Update key" : "Save key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editKey, setEditKey] = useState<ApiKey | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<ApiKey[] | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, "ok" | "error">>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<"active" | "inactive">>(new Set(["active", "inactive"]));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api-keys");
      setKeys(res.data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return keys.filter((k) => {
      const pInfo = PROVIDERS.find((p) => p.provider === k.provider);
      const matchesSearch = !q || k.label.toLowerCase().includes(q) || (pInfo?.label || k.provider).toLowerCase().includes(q);
      const matchesStatus = statusFilter.has(k.isActive ? "active" : "inactive");
      return matchesSearch && matchesStatus;
    });
  }, [keys, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const toggleStatusFilter = (s: "active" | "inactive") => {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next.size ? next : new Set(["active", "inactive"]);
    });
  };

  const toggleSelectAll = () => {
    if (pageRows.every((k) => selected.has(k._id))) {
      setSelected((prev) => { const n = new Set(prev); pageRows.forEach((k) => n.delete(k._id)); return n; });
    } else {
      setSelected((prev) => { const n = new Set(prev); pageRows.forEach((k) => n.add(k._id)); return n; });
    }
  };

  const handleDelete = async () => {
    if (!deleteTargets?.length) return;
    setDeleting(true);
    try {
      await Promise.all(deleteTargets.map((k) => api.delete(`/api-keys/${k._id}`)));
      toast.success(deleteTargets.length > 1 ? `${deleteTargets.length} keys removed` : "API key removed");
      setSelected((prev) => { const n = new Set(prev); deleteTargets.forEach((k) => n.delete(k._id)); return n; });
      setDeleteTargets(null);
      fetchKeys();
    } catch {
      toast.error("Failed to remove key");
    }
    setDeleting(false);
  };

  const handleTest = async (key: ApiKey) => {
    setTestingKey(key._id);
    try {
      await api.post(`/api-keys/${key.provider}/test`);
      setTestResults((prev) => ({ ...prev, [key._id]: "ok" }));
      toast.success(`${key.label} is valid`);
    } catch {
      setTestResults((prev) => ({ ...prev, [key._id]: "error" }));
      toast.error(`${key.label} test failed`);
    }
    setTestingKey(null);
    setTimeout(() => setTestResults((prev) => { const n = { ...prev }; delete n[key._id]; return n; }), 4000);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">API Keys</h1>
          <p className="text-sm text-muted-foreground">Manage your service API keys. All keys are encrypted with AES-256.</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-1.5">
          <Plus className="size-4" /> Create Api Key
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search key, name…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>

        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteTargets(keys.filter((k) => selected.has(k._id)))}
              className="gap-1.5"
            >
              <Trash2 className="size-3.5" /> Delete ({selected.size})
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
              <ListFilter className="size-3.5" /> Filters
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={statusFilter.has("active")} onCheckedChange={() => toggleStatusFilter("active")}>
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={statusFilter.has("inactive")} onCheckedChange={() => toggleStatusFilter("inactive")}>
                Inactive
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={pageRows.length > 0 && pageRows.every((k) => selected.has(k._id))}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Api Key</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">Loading…</TableCell>
                </TableRow>
              ) : pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Key className="size-6 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">No API keys found</p>
                      <p className="text-xs text-muted-foreground">
                        {keys.length === 0 ? "Add your first key to get started." : "Try a different search or filter."}
                      </p>
                      {keys.length === 0 && (
                        <Button size="sm" className="mt-1 gap-1.5" onClick={() => setShowAddDialog(true)}>
                          <Plus className="size-3.5" /> Add first key
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((key) => {
                  const pInfo = PROVIDERS.find((p) => p.provider === key.provider);
                  const testResult = testResults[key._id];
                  return (
                    <TableRow key={key._id}>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(key._id)}
                          onCheckedChange={() => setSelected((prev) => { const n = new Set(prev); n.has(key._id) ? n.delete(key._id) : n.add(key._id); return n; })}
                          aria-label={`Select ${key.label}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg border text-sm"
                            style={{ background: `${pInfo?.color || "#7c3aed"}15`, borderColor: `${pInfo?.color || "#7c3aed"}30` }}
                          >
                            {pInfo?.icon || "🔑"}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{key.label}</p>
                            <p className="truncate text-xs text-muted-foreground">{pInfo?.label || key.provider}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">••••••••••••</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(key.createdAt)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(key.updatedAt)}</TableCell>
                      <TableCell>
                        {testResult === "ok" ? (
                          <Badge className="border-emerald-500/25 bg-emerald-500/10 text-emerald-600">Valid</Badge>
                        ) : testResult === "error" ? (
                          <Badge className="border-destructive/25 bg-destructive/10 text-destructive">Failed</Badge>
                        ) : key.isActive ? (
                          <Badge className="border-emerald-500/25 bg-emerald-500/10 text-emerald-600">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Row actions" />}>
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleTest(key)} disabled={testingKey === key._id}>
                              <RefreshCw className={testingKey === key._id ? "animate-spin" : ""} /> Test key
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditKey(key)}>
                              <Pencil /> Update
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleteTargets([key])}>
                              <Trash2 /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} keys
            </span>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page">
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button variant="outline" size="icon-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page">
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <KeyDialog
        open={showAddDialog || !!editKey}
        existingKey={editKey}
        onClose={() => { setShowAddDialog(false); setEditKey(null); }}
        onSaved={() => { setShowAddDialog(false); setEditKey(null); fetchKeys(); }}
      />

      <AlertDialog open={!!deleteTargets} onOpenChange={(o) => !o && setDeleteTargets(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTargets && deleteTargets.length > 1 ? `Remove ${deleteTargets.length} API keys?` : "Remove API key?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTargets && deleteTargets.length > 1
                ? "These keys will be permanently removed. Any automations using them will stop working."
                : `"${deleteTargets?.[0]?.label}" will be permanently removed. Any automations using this key will stop working.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
