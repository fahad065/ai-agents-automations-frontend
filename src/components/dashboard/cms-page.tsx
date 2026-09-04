"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  BookOpen, Plus, Pencil, Trash2, Search,
  Loader2, ChevronLeft, ChevronRight, Save,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
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

interface BlogPost {
  _id: string;
  title: string;
  title_ar?: string;
  slug: string;
  excerpt?: string;
  excerpt_ar?: string;
  content?: string;
  content_ar?: string;
  category?: string;
  tags?: string[];
  isPublished: boolean;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
}

interface CmsPage {
  slug: string;
  title: string;
  content?: any;
  lastUpdatedBy?: string;
  updatedAt: string;
}

const fieldLabel = (text: string, className?: string) => (
  <Label className={cn("mb-1.25 block text-xs font-medium text-muted-foreground", className)}>{text}</Label>
);

// ── Language tab selector — shared by PageEditModal & BlogModal ──
function LangTabs({ lang, setLang, subs }: {
  lang: "en" | "ar"; setLang: (l: "en" | "ar") => void; subs: { en: string; ar: string };
}) {
  const items = [
    { key: "en" as const, icon: "🇬🇧", label: "English", sub: subs.en },
    { key: "ar" as const, icon: "🇦🇪", label: "العربية", sub: subs.ar },
  ];
  return (
    <div className="-mt-2 flex border-b">
      {items.map((l) => (
        <button
          key={l.key}
          onClick={() => setLang(l.key)}
          className={cn(
            "flex flex-1 items-center gap-2.5 border-b-2 px-5 py-3 transition-colors",
            lang === l.key
              ? l.key === "ar"
                ? "border-amber-500 bg-amber-500/[0.08]"
                : "border-primary bg-primary/[0.06]"
              : "border-transparent bg-transparent",
          )}
        >
          <span className="text-lg">{l.icon}</span>
          <div className="text-left">
            <p className={cn("mb-0.25 text-[13px] font-semibold", lang === l.key ? "text-foreground" : "text-muted-foreground")}>
              {l.label}
            </p>
            <p className="text-[10px] text-muted-foreground/70">{l.sub}</p>
          </div>
          {lang === l.key && (
            <div className={cn("ml-auto size-1.75 rounded-full", l.key === "ar" ? "bg-amber-500" : "bg-primary")} />
          )}
        </button>
      ))}
    </div>
  );
}

function ArabicActiveBanner({ note }: { note: string }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-amber-500/20 bg-amber-500/[0.07] px-6 py-2 text-xs text-amber-500">
      <span className="font-bold">Arabic mode active</span>
      <span className="text-muted-foreground">— {note}</span>
    </div>
  );
}

// ── Page Edit Modal ───────────────────────────────────────────
function PageEditModal({ page, onClose, onSave }: {
  page: CmsPage; onClose: () => void; onSave: () => void;
}) {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [pageData, setPageData] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAr = lang === "ar";
  const isFaq = page.slug === "faq";

  useEffect(() => {
    api.get(`/cms/admin/pages/${page.slug}`)
      .then((r) => setPageData(r.data))
      .catch(() => setPageData({ slug: page.slug, title: page.title }))
      .finally(() => setFetching(false));
  }, [page.slug]);

  const set = (field: string, value: any) =>
    setPageData((p: any) => ({ ...p, [field]: value }));

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await api.put(`/cms/admin/pages/${page.slug}`, pageData);
      toast.success("Content updated successfully");
      onSave(); onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save page");
    }
    setSaving(false);
  };

  const faqField = isAr ? "faqItems_ar" : "faqItems";
  const faqItems: any[] = pageData?.[faqField] || [];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[92vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Page — <span className="text-[#a78bfa]">/{page.slug}</span></DialogTitle>
        </DialogHeader>
        <p className="-mt-3 text-xs text-muted-foreground">
          Select a language tab to edit the English or Arabic content
        </p>

        <LangTabs
          lang={lang}
          setLang={setLang}
          subs={{ en: "Default content", ar: "UAE dialect · اللهجة الإماراتية" }}
        />

        {isAr && <ArabicActiveBanner note="you are editing Arabic (UAE dialect) content. All changes save to the _ar fields." />}

        {/* Form body */}
        <div className="flex-1 overflow-auto">
          {fetching ? (
            <div className="p-12 text-center">
              <Loader2 size={24} className="mx-auto animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col gap-3.5" dir={isAr ? "rtl" : "ltr"}>
              {/* Title */}
              <div>
                {fieldLabel(isAr ? "العنوان (عربي)" : "Page Title")}
                <Input
                  value={(isAr ? pageData?.title_ar : pageData?.title) || ""}
                  onChange={(e) => set(isAr ? "title_ar" : "title", e.target.value)}
                  placeholder={isAr ? "أدخل العنوان بالعربي..." : "Enter page title..."}
                />
              </div>

              {/* Subtitle */}
              <div>
                {fieldLabel(isAr ? "النبذة (عربي)" : "Subtitle")}
                <Input
                  value={(isAr ? pageData?.subtitle_ar : pageData?.subtitle) || ""}
                  onChange={(e) => set(isAr ? "subtitle_ar" : "subtitle", e.target.value)}
                  placeholder={isAr ? "أدخل النبذة بالعربي..." : "Enter subtitle..."}
                />
              </div>

              {/* SEO fields — EN only */}
              {!isAr && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    {fieldLabel("Meta title (SEO)")}
                    <Input value={pageData?.metaTitle || ""} onChange={(e) => set("metaTitle", e.target.value)} />
                  </div>
                  <div>
                    {fieldLabel("Meta description (SEO)")}
                    <Input value={pageData?.metaDescription || ""} onChange={(e) => set("metaDescription", e.target.value)} />
                  </div>
                </div>
              )}

              {/* Content HTML */}
              {!isFaq && (
                <div>
                  {fieldLabel(isAr ? "المحتوى بالعربي (HTML)" : "Content (HTML)")}
                  <Textarea
                    value={(isAr ? pageData?.content_ar : pageData?.content) || ""}
                    onChange={(e) => set(isAr ? "content_ar" : "content", e.target.value)}
                    rows={16}
                    className="font-mono text-xs leading-relaxed"
                    placeholder={isAr ? "<h2>العنوان</h2><p>المحتوى هنا...</p>" : "<h2>Heading</h2><p>Content here...</p>"}
                  />
                </div>
              )}

              {/* FAQ items editor */}
              {isFaq && (
                <div>
                  {fieldLabel(isAr ? `الأسئلة الشائعة (عربي) — ${faqItems.length} سؤال` : `FAQ Items — ${faqItems.length} questions`, "mb-2")}
                  {faqItems.map((item: any, i: number) => (
                    <div key={i} className="mb-2 rounded-lg border bg-muted/40 p-3">
                      <Input
                        value={item.question || ""}
                        dir={isAr ? "rtl" : "ltr"}
                        onChange={(e) => {
                          const updated = [...faqItems];
                          updated[i] = { ...updated[i], question: e.target.value };
                          set(faqField, updated);
                        }}
                        placeholder={isAr ? "السؤال بالعربي..." : "Question..."}
                        className="mb-2"
                      />
                      <Textarea
                        value={item.answer || ""}
                        dir={isAr ? "rtl" : "ltr"}
                        onChange={(e) => {
                          const updated = [...faqItems];
                          updated[i] = { ...updated[i], answer: e.target.value };
                          set(faqField, updated);
                        }}
                        placeholder={isAr ? "الإجابة بالعربي..." : "Answer..."}
                        rows={2}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => set(faqField, [...faqItems, { question: "", answer: "", order: faqItems.length + 1 }])}
                    className="gap-1.5"
                  >
                    <Plus size={12} /> {isAr ? "إضافة سؤال جديد" : "Add FAQ item"}
                  </Button>
                </div>
              )}

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving || fetching}
            className={cn("gap-2", isAr && "bg-amber-600 hover:bg-amber-600/90")}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : (isAr ? "حفظ المحتوى العربي" : "Save Changes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Blog Post Modal ───────────────────────────────────────────
function BlogModal({ post, onClose, onSave }: {
  post?: BlogPost; onClose: () => void; onSave: () => void;
}) {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [fetching, setFetching] = useState(!!post?._id);
  const [form, setForm] = useState({
    title: post?.title || "",
    title_ar: post?.title_ar || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    excerpt_ar: post?.excerpt_ar || "",
    content: post?.content || "",
    content_ar: post?.content_ar || "",
    category: post?.category || "",
    tags: post?.tags?.join(", ") || "",
    isPublished: post?.isPublished ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAr = lang === "ar";

  // Fetch full post data (includes _ar fields) when editing
  useEffect(() => {
    if (!post?._id) return;
    api.get(`/cms/admin/blog/${post._id}`)
      .then((r) => {
        const d = r.data;
        setForm({
          title: d.title || "",
          title_ar: d.title_ar || "",
          slug: d.slug || "",
          excerpt: d.excerpt || "",
          excerpt_ar: d.excerpt_ar || "",
          content: d.content || "",
          content_ar: d.content_ar || "",
          category: d.category || "",
          tags: (d.tags || []).join(", "),
          isPublished: d.isPublished ?? false,
        });
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [post?._id]);

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const set = (field: string, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.title.trim()) { setError("English title is required"); return; }
    setSaving(true); setError("");
    try {
      const payload = {
        title: form.title,
        title_ar: form.title_ar,
        slug: form.slug || autoSlug(form.title),
        excerpt: form.excerpt,
        excerpt_ar: form.excerpt_ar,
        content: form.content,
        content_ar: form.content_ar,
        category: form.category,
        tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
        isPublished: form.isPublished,
      };
      if (post?._id) {
        await api.put(`/cms/admin/blog/${post._id}`, payload);
        toast.success("Post updated successfully");
      } else {
        await api.post("/cms/admin/blog", payload);
        toast.success("Post created successfully");
      }
      onSave(); onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save");
    }
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[92vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{post ? "Edit Blog Post" : "New Blog Post"}</DialogTitle>
        </DialogHeader>
        <p className="-mt-3 text-xs text-muted-foreground">
          Select a language tab to edit the English or Arabic content
        </p>

        <LangTabs
          lang={lang}
          setLang={setLang}
          subs={{ en: "Title · excerpt · content · settings", ar: "UAE dialect · عنوان · مقتطف · محتوى" }}
        />

        {isAr && <ArabicActiveBanner note="editing Arabic (UAE dialect). Changes save to title_ar, excerpt_ar, content_ar." />}

        {/* Form body */}
        <div className="flex-1 overflow-auto" dir={isAr ? "rtl" : "ltr"}>
          {fetching ? (
            <div className="p-12 text-center">
              <Loader2 size={24} className="mx-auto animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {/* ── ENGLISH fields ── */}
              {!isAr && (
                <>
                  <div>
                    {fieldLabel("Title (EN) *")}
                    <Input
                      value={form.title}
                      onChange={(e) => setForm(f => ({
                        ...f, title: e.target.value,
                        slug: post ? f.slug : autoSlug(e.target.value),
                      }))}
                      placeholder="How AI is changing content creation"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      {fieldLabel("Slug")}
                      <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="how-ai-changing-content" />
                    </div>
                    <div>
                      {fieldLabel("Category")}
                      <Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="AI, YouTube, Marketing" />
                    </div>
                  </div>

                  <div>
                    {fieldLabel("Excerpt")}
                    <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} placeholder="Short description shown in blog listing..." />
                  </div>

                  <div>
                    {fieldLabel("Content (HTML / Markdown)")}
                    <Textarea
                      value={form.content}
                      onChange={(e) => set("content", e.target.value)}
                      rows={10}
                      className="font-mono text-xs leading-relaxed"
                      placeholder="<h2>Heading</h2><p>Content here...</p>"
                    />
                  </div>

                  <div>
                    <Label className="mb-1.25 block text-xs font-medium text-muted-foreground">
                      Tags <span className="font-normal">(comma separated)</span>
                    </Label>
                    <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="ai, youtube, automation, content" />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border bg-background px-3.5 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-foreground">Published</p>
                      <p className="text-[11px] text-muted-foreground">
                        {form.isPublished ? "Visible on website" : "Draft — not visible yet"}
                      </p>
                    </div>
                    <Switch checked={form.isPublished} onCheckedChange={(v: boolean) => set("isPublished", v)} />
                  </div>
                </>
              )}

              {/* ── ARABIC fields ── */}
              {isAr && (
                <>
                  <div>
                    {fieldLabel("العنوان (عربي) — Title")}
                    <Input value={form.title_ar} onChange={(e) => set("title_ar", e.target.value)} dir="rtl" placeholder="كيف يغير الذكاء الاصطناعي إنشاء المحتوى..." />
                  </div>

                  <div>
                    {fieldLabel("المقتطف (عربي) — Excerpt")}
                    <Textarea value={form.excerpt_ar} onChange={(e) => set("excerpt_ar", e.target.value)} rows={2} dir="rtl" placeholder="وصف قصير يظهر في قائمة المدونة..." />
                  </div>

                  <div>
                    {fieldLabel("المحتوى بالعربي (HTML) — Content")}
                    <Textarea
                      value={form.content_ar}
                      onChange={(e) => set("content_ar", e.target.value)}
                      rows={14}
                      dir="rtl"
                      className="font-mono text-xs leading-relaxed"
                      placeholder="<h2>عنوان</h2><p>محتوى المقال هنا...</p>"
                    />
                  </div>

                  <div className="rounded-lg border border-amber-500/15 bg-amber-500/5 px-3.5 py-2.5 text-xs text-muted-foreground">
                    Slug, category, and tags are shared across languages (set in the English tab).
                  </div>
                </>
              )}

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving || fetching}
            className={cn("gap-2", isAr && "bg-amber-600 hover:bg-amber-600/90")}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : isAr ? "حفظ المحتوى العربي" : (post ? "Save Changes" : "Publish Post")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main CMS Page ─────────────────────────────────────────────
export function CmsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") router.push("/dashboard");
  }, [user]);

  const [tab, setTab] = useState<"blog" | "pages">("blog");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Blog modal state
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  // Page edit modal state
  const [showPageModal, setShowPageModal] = useState(false);
  const [editPage, setEditPage] = useState<CmsPage | undefined>();

  const limit = 10;

  useEffect(() => { fetchData(); }, [tab, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === "blog") {
        const res = await api.get(`/cms/admin/blog?page=${page}&limit=${limit}`);
        setPosts(res.data?.posts || res.data?.data || []);
        setTotal(res.data?.total || 0);
      } else {
        const slugs = ["about", "contact", "privacy", "terms", "cookies", "faq", "refund"];
        const results = await Promise.allSettled(
          slugs.map(s => api.get(`/cms/admin/pages/${s}`))
        );
        setPages(
          results
            .filter(r => r.status === "fulfilled")
            .map((r: any) => r.value.data)
            .filter(Boolean)
        );
      }
    } catch {}
    setLoading(false);
  };

  const confirmDeletePost = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/cms/admin/blog/${deleteTarget._id}`);
      toast.success("Deleted successfully");
      fetchData();
    } catch {
      toast.error("Failed to delete post");
    }
    setDeleteTarget(null);
  };

  const totalPages = Math.ceil(total / limit);

  const filteredPosts = posts.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground">Content CMS</h1>
          <p className="text-sm text-muted-foreground">Manage blog posts and website pages.</p>
        </div>
        {tab === "blog" && (
          <Button onClick={() => { setEditPost(undefined); setShowBlogModal(true); }} className="gap-2">
            <Plus size={15} /> New Post
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-lg border bg-card p-1">
        {(["blog", "pages"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); }}
            className={cn(
              "rounded-md border-none px-5 py-1.75 text-[13px] whitespace-nowrap",
              tab === t ? "bg-background font-semibold text-foreground shadow-sm" : "bg-transparent font-normal text-muted-foreground",
            )}
          >
            {t === "blog" ? "📝 Blog Posts" : "📄 Pages"}
          </button>
        ))}
      </div>

      {/* ── BLOG TAB ── */}
      {tab === "blog" && (
        <>
          <div className="mb-3.5 flex items-center gap-2.5 rounded-lg border bg-card p-3">
            <div className="relative flex-1">
              <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." className="pl-7.5" />
            </div>
            <span className="text-xs text-muted-foreground">{total} posts</span>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[1fr_100px_80px_90px_100px] gap-2.5 border-b bg-background px-4.5 py-2.5">
                  {["Title", "Category", "Status", "Date", "Actions"].map(h => (
                    <span key={h} className="text-[11px] font-semibold text-muted-foreground">{h}</span>
                  ))}
                </div>

                {loading ? (
                  <div className="p-15 text-center">
                    <Loader2 size={22} className="mx-auto animate-spin text-primary" />
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="p-15 text-center">
                    <BookOpen size={32} className="mx-auto mb-3 text-muted-foreground" />
                    <p className="mb-4 text-sm text-muted-foreground">No blog posts yet</p>
                    <Button size="sm" onClick={() => { setEditPost(undefined); setShowBlogModal(true); }} className="gap-1.5">
                      <Plus size={13} /> Write first post
                    </Button>
                  </div>
                ) : (
                  filteredPosts.map((post, i) => (
                    <div
                      key={post._id}
                      className={cn(
                        "grid grid-cols-[1fr_100px_80px_90px_100px] items-center gap-2.5 px-4.5 py-3 hover:bg-background",
                        i < filteredPosts.length - 1 && "border-b",
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-foreground">
                            {post.title}
                          </p>
                          {post.title_ar && (
                            <span className="shrink-0 rounded bg-amber-500/[0.12] px-1.25 py-0.25 text-[9px] font-bold text-amber-500">🇦🇪 AR</span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">/{post.slug}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{post.category || "—"}</span>
                      <span
                        className={cn(
                          "inline-block w-fit rounded-full px-2 py-0.75 text-[11px] font-semibold",
                          post.isPublished ? "bg-[#22c55e]/10 text-[#22c55e]" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {post.isPublished ? "Live" : "Draft"}
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => { setEditPost(post); setShowBlogModal(true); }}
                          className="border-primary/20 bg-primary/[0.06] text-[#a78bfa] hover:bg-primary/15 hover:text-[#a78bfa]"
                        >
                          <Pencil size={12} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteTarget(post)}
                          className="border-destructive/20 bg-destructive/[0.06] text-destructive hover:bg-destructive/15 hover:text-destructive"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft size={13} />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRight size={13} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── PAGES TAB ── */}
      {tab === "pages" && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b px-4.5 py-3.5">
            <p className="text-[13px] text-muted-foreground">
              Edit website page content. Changes are live immediately after saving.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <Loader2 size={22} className="mx-auto animate-spin text-primary" />
            </div>
          ) : pages.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-[13px] text-muted-foreground">No pages found.</p>
            </div>
          ) : (
            pages.map((p, i) => (
              <div
                key={p.slug}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 px-4.5 py-3.5 hover:bg-background",
                  i < pages.length - 1 && "border-b",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                    <Globe size={15} className="text-[#a78bfa]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground capitalize">{p.title || p.slug}</p>
                    <p className="text-[11px] text-muted-foreground">
                      /{p.slug}
                      {p.updatedAt && ` · Last updated ${new Date(p.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                      {p.lastUpdatedBy && ` by ${p.lastUpdatedBy}`}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEditPage(p); setShowPageModal(true); }}
                  className="gap-1.5 border-primary/20 bg-primary/[0.06] text-[#a78bfa] hover:bg-primary/15 hover:text-[#a78bfa]"
                >
                  <Pencil size={12} /> Edit
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Blog modal */}
      {showBlogModal && (
        <BlogModal
          post={editPost}
          onClose={() => { setShowBlogModal(false); setEditPost(undefined); }}
          onSave={fetchData}
        />
      )}

      {/* Page edit modal */}
      {showPageModal && editPage && (
        <PageEditModal
          page={editPage}
          onClose={() => { setShowPageModal(false); setEditPage(undefined); }}
          onSave={fetchData}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && `"${deleteTarget.title}" will be permanently deleted. This can't be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePost} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
