"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Loader2, Package, Check, Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Module {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  moduleType: string;
}

interface Industry {
  _id: string;
  slug: string;
  name: string;
  name_ar?: string;
  icon: string;
  color: string;
  description?: string;
  description_ar?: string;
  availableIn: string[];
  sortOrder: number;
  isActive: boolean;
  defaultModuleIds: (string | Module)[];
}

const emptyForm = {
  slug: "", name: "", name_ar: "",
  icon: "🏢", color: "#7c3aed",
  description: "", description_ar: "",
  availableIn: ["UAE"] as string[],
  sortOrder: 1, isActive: true,
  defaultModuleIds: [] as string[],
};

export function AdminIndustries() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activeTab, setActiveTab] = useState<"details" | "arabic" | "modules">("details");
  const [moduleSearch, setModuleSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [indRes, modRes] = await Promise.all([
        api.get("/industries"),
        api.get("/modules?limit=200"),
      ]);
      setIndustries(indRes.data || []);
      setAllModules((modRes.data?.data || modRes.data) || []);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setActiveTab("details");
    setShowForm(true);
  };

  const openEdit = (ind: Industry) => {
    setForm({
      slug: ind.slug,
      name: ind.name,
      name_ar: ind.name_ar || "",
      icon: ind.icon,
      color: ind.color,
      description: ind.description || "",
      description_ar: ind.description_ar || "",
      availableIn: ind.availableIn || ["UAE"],
      sortOrder: ind.sortOrder || 1,
      isActive: ind.isActive ?? true,
      defaultModuleIds: ind.defaultModuleIds.map((m: any) => m._id || m),
    });
    setEditingId(ind._id);
    setActiveTab("details");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        name_ar: form.name_ar.trim() || undefined,
        slug: form.slug.toLowerCase().replace(/\s+/g, "_"),
        icon: form.icon.trim(),
        color: form.color.trim(),
        description: form.description.trim() || undefined,
        description_ar: form.description_ar.trim() || undefined,
        availableIn: form.availableIn,
        sortOrder: Number(form.sortOrder),
        isActive: form.isActive,
        defaultModuleIds: form.defaultModuleIds,
      };
      if (editingId) {
        await api.patch(`/industries/${form.slug}`, payload);
        toast.success("Industry updated");
      } else {
        await api.post("/industries", payload);
        toast.success("Industry created");
      }
      setShowForm(false);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const toggleModule = (id: string) => {
    setForm(f => ({
      ...f,
      defaultModuleIds: f.defaultModuleIds.includes(id)
        ? f.defaultModuleIds.filter(m => m !== id)
        : [...f.defaultModuleIds, id],
    }));
  };

  const toggleCountry = (c: string) => {
    setForm(f => ({
      ...f,
      availableIn: f.availableIn.includes(c)
        ? f.availableIn.filter(x => x !== c)
        : [...f.availableIn, c],
    }));
  };

  const filteredModules = allModules.filter(m =>
    m.name.toLowerCase().includes(moduleSearch.toLowerCase()) ||
    m.slug.toLowerCase().includes(moduleSearch.toLowerCase())
  );

  return (
    <div className="max-w-[1100px] p-6">
      {/* Header */}
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground">Industries</h1>
          <p className="text-[13px] text-muted-foreground">Manage industry bundles and their default module assignments.</p>
        </div>
        <Button onClick={openNew} className="gap-1.5">
          <Plus size={14} /> Add Industry
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-15 text-center">
          <Loader2 size={24} className="mx-auto animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {["Industry", "Slug", "Countries", "Default Modules", "Sort", "Status", ""].map(h => (
                    <TableHead key={h} className="whitespace-nowrap">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {industries.map((ind) => (
                  <TableRow key={ind._id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex size-9 shrink-0 items-center justify-center rounded-lg border text-lg"
                          style={{ background: `${ind.color}15`, borderColor: `${ind.color}30` }}
                        >
                          {ind.icon}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">{ind.name}</p>
                          {ind.name_ar && <p className="text-[11px] text-muted-foreground" dir="rtl">{ind.name_ar}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-primary/10 px-1.75 py-0.5 text-[11px] text-[#a78bfa]">{ind.slug}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {ind.availableIn.map(c => (
                          <span key={c} className="rounded-full border border-[#22c55e]/20 bg-[#22c55e]/10 px-2 py-0.5 text-[10px] font-semibold text-[#22c55e]">{c}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Package size={12} />
                        <span className="text-[13px]">{ind.defaultModuleIds.length} modules</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{ind.sortOrder}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2.25 py-0.75 text-[11px] font-semibold",
                          ind.isActive ? "bg-[#22c55e]/[0.12] text-[#22c55e]" : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {ind.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openEdit(ind)} className="gap-1.5">
                        <Pencil size={11} /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? `Edit: ${form.name}` : "New Industry"}</DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="-mt-2 flex border-b">
            {(["details", "arabic", "modules"] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  "border-b-2 px-4 py-2.5 text-[13px] capitalize",
                  activeTab === t ? "border-primary font-semibold text-[#a78bfa]" : "border-transparent font-normal text-muted-foreground",
                )}
              >
                {t === "arabic" ? "🇦🇪 Arabic" : t === "modules" ? `Modules (${form.defaultModuleIds.length})` : t}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {/* DETAILS TAB */}
            {activeTab === "details" && (
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <div className="mb-4">
                  <Label className="mb-1 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Real Estate" />
                </div>
                <div className="mb-4">
                  <Label className="mb-1 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Slug *</Label>
                  <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "_") }))} placeholder="real_estate" />
                </div>
                <div className="mb-4">
                  <Label className="mb-1 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Icon <span className="font-normal normal-case">(emoji)</span></Label>
                  <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🏢" />
                </div>
                <div className="mb-4">
                  <Label className="mb-1 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Color <span className="font-normal normal-case">(hex)</span></Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.color}
                      onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                      className="h-9 w-11 cursor-pointer rounded-lg border p-0.5"
                    />
                    <Input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="flex-1" />
                  </div>
                </div>
                <div className="mb-4">
                  <Label className="mb-1 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Sort Order</Label>
                  <Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} />
                </div>
                <div className="mb-4">
                  <Label className="mb-1 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Countries</Label>
                  <div className="flex gap-2">
                    {["UAE", "Kenya"].map(c => (
                      <button
                        key={c}
                        onClick={() => toggleCountry(c)}
                        className={cn(
                          "rounded-lg border px-4 py-1.75 text-xs font-semibold",
                          form.availableIn.includes(c)
                            ? "border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]"
                            : "border-border bg-transparent text-muted-foreground",
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-full mb-4">
                  <Label className="mb-1 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Description</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                </div>
                <div className="col-span-full mb-4">
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
                    <Checkbox checked={form.isActive} onCheckedChange={(v: boolean) => setForm(f => ({ ...f, isActive: !!v }))} />
                    Active (visible to users)
                  </label>
                </div>
              </div>
            )}

            {/* ARABIC TAB */}
            {activeTab === "arabic" && (
              <div>
                <div className="mb-5 rounded-lg border border-primary/20 bg-primary/[0.06] p-3.5">
                  <p className="mb-1 text-xs font-semibold text-[#a78bfa]">🇦🇪 Arabic (UAE) Content</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">These fields are shown when the portal language is set to Arabic (AR). Leave blank to fall back to English.</p>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <Label className="mb-1 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Name (AR) — الاسم</Label>
                    <Input value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} placeholder="العقارات" dir="rtl" />
                  </div>
                  <div>
                    <Label className="mb-1 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Description (AR) — الوصف</Label>
                    <Textarea value={form.description_ar} onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))} rows={4} placeholder="وصف الصناعة بالعربية..." dir="rtl" />
                  </div>
                </div>
              </div>
            )}

            {/* MODULES TAB */}
            {activeTab === "modules" && (
              <div>
                <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-500/[0.06] p-3.5">
                  <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-blue-500">
                    <Package size={11} />
                    Default Modules ({form.defaultModuleIds.length} selected)
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    These modules are automatically included when a user subscribes to this industry. Users can add more on top.
                  </p>
                </div>
                <Input
                  value={moduleSearch}
                  onChange={e => setModuleSearch(e.target.value)}
                  placeholder="Search modules..."
                  className="mb-3.5"
                />
                <div className="flex max-h-[340px] flex-col gap-1.5 overflow-y-auto">
                  {filteredModules.map(m => {
                    const selected = form.defaultModuleIds.includes(m._id);
                    return (
                      <div
                        key={m._id}
                        onClick={() => toggleModule(m._id)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 transition-colors",
                          selected ? "border-primary/35 bg-primary/[0.07]" : "border-border bg-transparent",
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded border-2",
                            selected ? "border-primary bg-primary" : "border-border bg-transparent",
                          )}
                        >
                          {selected && <Check size={11} className="text-primary-foreground" strokeWidth={3} />}
                        </div>
                        <span className="text-base">{m.icon}</span>
                        <div className="flex-1">
                          <p className="text-[13px] font-medium text-foreground">{m.name}</p>
                          <p className="text-[11px] text-muted-foreground">{m.moduleType} · {m.slug}</p>
                        </div>
                        {selected && <Globe size={13} className="text-primary" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? "Saving..." : "Save Industry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
