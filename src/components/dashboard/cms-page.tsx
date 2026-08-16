"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  BookOpen, Plus, Pencil, Trash2, Search,
  Loader2, ChevronLeft, ChevronRight, X, Save,
  Globe, FileText,
} from "lucide-react";
import { toast } from "sonner";

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

// ── Page Edit Modal ───────────────────────────────────────────
function PageEditModal({ page, onClose, onSave, colors, isDark }: {
  page: CmsPage; onClose: () => void;
  onSave: () => void; colors: any; isDark: boolean;
}) {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [pageData, setPageData] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const panelBg = isDark ? "#161616" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";
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

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", boxSizing: "border-box" as const,
    marginBottom: "12px",
  };

  const faqField = isAr ? "faqItems_ar" : "faqItems";
  const faqItems: any[] = pageData?.[faqField] || [];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: panelBg, border: `1px solid ${panelBorder}`,
        borderRadius: "16px", width: "100%", maxWidth: "760px",
        maxHeight: "92vh", display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
      }}>

        {/* Modal header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: `1px solid ${panelBorder}` }}>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: isDark ? "#e5e5e5" : "#111" }}>
              Edit Page — <span style={{ color: "#a78bfa" }}>/{page.slug}</span>
            </p>
            <p style={{ fontSize: "12px", color: isDark ? "#737373" : "#6b7280", marginTop: "2px" }}>
              Select a language tab to edit the English or Arabic content
            </p>
          </div>
          <button onClick={onClose} style={{
            width: "28px", height: "28px", borderRadius: "7px", border: `1px solid ${panelBorder}`,
            background: "transparent", color: isDark ? "#737373" : "#6b7280",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={13} />
          </button>
        </div>

        {/* Language selector */}
        <div style={{ display: "flex", borderBottom: `1px solid ${panelBorder}` }}>
          {([
            { key: "en" as const, icon: "🇬🇧", label: "English", sub: "Default content" },
            { key: "ar" as const, icon: "🇦🇪", label: "العربية", sub: "UAE dialect · اللهجة الإماراتية" },
          ]).map((l) => (
            <button
              key={l.key}
              onClick={() => setLang(l.key)}
              style={{
                flex: 1, padding: "12px 20px", border: "none", cursor: "pointer",
                background: lang === l.key
                  ? (l.key === "ar" ? "rgba(245,158,11,0.08)" : "rgba(124,58,237,0.06)")
                  : "transparent",
                borderBottom: lang === l.key
                  ? `2px solid ${l.key === "ar" ? "#f59e0b" : "#7c3aed"}`
                  : "2px solid transparent",
                display: "flex", alignItems: "center", gap: "10px",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "18px" }}>{l.icon}</span>
              <div style={{ textAlign: "left" }}>
                <p style={{
                  fontSize: "13px", fontWeight: 600, marginBottom: "1px",
                  color: lang === l.key ? (isDark ? "#e5e5e5" : "#111") : (isDark ? "#737373" : "#6b7280"),
                }}>
                  {l.label}
                </p>
                <p style={{ fontSize: "10px", color: isDark ? "#525252" : "#9ca3af" }}>{l.sub}</p>
              </div>
              {lang === l.key && (
                <div style={{
                  marginLeft: "auto", width: "7px", height: "7px", borderRadius: "50%",
                  background: l.key === "ar" ? "#f59e0b" : "#7c3aed",
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Arabic active banner */}
        {isAr && (
          <div style={{
            padding: "8px 24px",
            background: "rgba(245,158,11,0.07)",
            borderBottom: `1px solid rgba(245,158,11,0.18)`,
            fontSize: "12px", color: "#f59e0b",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <span style={{ fontWeight: 700 }}>Arabic mode active</span>
            <span style={{ color: isDark ? "#737373" : "#9ca3af" }}>— you are editing Arabic (UAE dialect) content. All changes save to the _ar fields.</span>
          </div>
        )}

        {/* Form body */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
          {fetching ? (
            <div style={{ textAlign: "center", padding: "48px" }}>
              <Loader2 size={24} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }} dir={isAr ? "rtl" : "ltr"}>

              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: isDark ? "#a3a3a3" : "#6b7280", marginBottom: "5px" }}>
                  {isAr ? "العنوان (عربي)" : "Page Title"}
                </label>
                <input
                  value={(isAr ? pageData?.title_ar : pageData?.title) || ""}
                  onChange={(e) => set(isAr ? "title_ar" : "title", e.target.value)}
                  style={inp}
                  placeholder={isAr ? "أدخل العنوان بالعربي..." : "Enter page title..."}
                />
              </div>

              {/* Subtitle */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: isDark ? "#a3a3a3" : "#6b7280", marginBottom: "5px" }}>
                  {isAr ? "النبذة (عربي)" : "Subtitle"}
                </label>
                <input
                  value={(isAr ? pageData?.subtitle_ar : pageData?.subtitle) || ""}
                  onChange={(e) => set(isAr ? "subtitle_ar" : "subtitle", e.target.value)}
                  style={inp}
                  placeholder={isAr ? "أدخل النبذة بالعربي..." : "Enter subtitle..."}
                />
              </div>

              {/* SEO fields — EN only */}
              {!isAr && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: isDark ? "#a3a3a3" : "#6b7280", marginBottom: "5px" }}>
                      Meta title (SEO)
                    </label>
                    <input value={pageData?.metaTitle || ""} onChange={(e) => set("metaTitle", e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: isDark ? "#a3a3a3" : "#6b7280", marginBottom: "5px" }}>
                      Meta description (SEO)
                    </label>
                    <input value={pageData?.metaDescription || ""} onChange={(e) => set("metaDescription", e.target.value)} style={inp} />
                  </div>
                </div>
              )}

              {/* Content HTML */}
              {!isFaq && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: isDark ? "#a3a3a3" : "#6b7280", marginBottom: "5px" }}>
                    {isAr ? "المحتوى بالعربي (HTML)" : "Content (HTML)"}
                  </label>
                  <textarea
                    value={(isAr ? pageData?.content_ar : pageData?.content) || ""}
                    onChange={(e) => set(isAr ? "content_ar" : "content", e.target.value)}
                    rows={16}
                    style={{ ...inp, resize: "vertical" as const, fontFamily: "monospace", fontSize: "12px", lineHeight: 1.7 }}
                    placeholder={isAr ? "<h2>العنوان</h2><p>المحتوى هنا...</p>" : "<h2>Heading</h2><p>Content here...</p>"}
                  />
                </div>
              )}

              {/* FAQ items editor */}
              {isFaq && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: isDark ? "#a3a3a3" : "#6b7280", marginBottom: "8px" }}>
                    {isAr ? `الأسئلة الشائعة (عربي) — ${faqItems.length} سؤال` : `FAQ Items — ${faqItems.length} questions`}
                  </label>
                  {faqItems.map((item: any, i: number) => (
                    <div key={i} style={{
                      background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                      border: `1px solid ${panelBorder}`, borderRadius: "8px",
                      padding: "12px", marginBottom: "8px",
                    }}>
                      <input
                        value={item.question || ""}
                        dir={isAr ? "rtl" : "ltr"}
                        onChange={(e) => {
                          const updated = [...faqItems];
                          updated[i] = { ...updated[i], question: e.target.value };
                          set(faqField, updated);
                        }}
                        placeholder={isAr ? "السؤال بالعربي..." : "Question..."}
                        style={{ ...inp, marginBottom: "8px" }}
                      />
                      <textarea
                        value={item.answer || ""}
                        dir={isAr ? "rtl" : "ltr"}
                        onChange={(e) => {
                          const updated = [...faqItems];
                          updated[i] = { ...updated[i], answer: e.target.value };
                          set(faqField, updated);
                        }}
                        placeholder={isAr ? "الإجابة بالعربي..." : "Answer..."}
                        rows={2}
                        style={{ ...inp, resize: "vertical" as const, marginBottom: 0 }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => set(faqField, [...faqItems, { question: "", answer: "", order: faqItems.length + 1 }])}
                    style={{
                      padding: "8px 16px", borderRadius: "8px", fontSize: "12px",
                      border: `1px solid ${panelBorder}`, background: "transparent",
                      color: isDark ? "#a3a3a3" : "#6b7280", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "6px",
                    }}
                  >
                    <Plus size={12} /> {isAr ? "إضافة سؤال جديد" : "Add FAQ item"}
                  </button>
                </div>
              )}

              {error && (
                <p style={{ fontSize: "12px", color: "#ef4444", padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: "7px" }}>{error}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${panelBorder}`, display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer",
            border: `1px solid ${panelBorder}`, background: "transparent",
            color: isDark ? "#a3a3a3" : "#4b5563", fontSize: "13px",
          }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || fetching} style={{
            flex: 2, padding: "10px", borderRadius: "8px",
            cursor: saving ? "not-allowed" : "pointer",
            background: isAr
              ? "linear-gradient(135deg, #d97706, #b45309)"
              : "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white", border: "none", fontSize: "13px", fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
            {saving ? "Saving..." : (isAr ? "حفظ المحتوى العربي" : "Save Changes")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Blog Post Modal ───────────────────────────────────────────
function BlogModal({ post, onClose, onSave, colors, isDark }: {
  post?: BlogPost; onClose: () => void;
  onSave: () => void; colors: any; isDark: boolean;
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

  const panelBg = isDark ? "#161616" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";
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

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", boxSizing: "border-box" as const,
    marginBottom: "12px",
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: panelBg, border: `1px solid ${panelBorder}`,
        borderRadius: "16px", width: "100%", maxWidth: "720px",
        maxHeight: "92vh", display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: `1px solid ${panelBorder}` }}>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: isDark ? "#e5e5e5" : "#111" }}>
              {post ? "Edit Blog Post" : "New Blog Post"}
            </p>
            <p style={{ fontSize: "12px", color: isDark ? "#737373" : "#6b7280", marginTop: "2px" }}>
              Select a language tab to edit the English or Arabic content
            </p>
          </div>
          <button onClick={onClose} style={{
            width: "28px", height: "28px", borderRadius: "7px", border: `1px solid ${panelBorder}`,
            background: "transparent", color: isDark ? "#737373" : "#6b7280",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={13} />
          </button>
        </div>

        {/* Language tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${panelBorder}` }}>
          {([
            { key: "en" as const, icon: "🇬🇧", label: "English", sub: "Title · excerpt · content · settings" },
            { key: "ar" as const, icon: "🇦🇪", label: "العربية", sub: "UAE dialect · عنوان · مقتطف · محتوى" },
          ]).map((l) => (
            <button key={l.key} onClick={() => setLang(l.key)} style={{
              flex: 1, padding: "12px 20px", border: "none", cursor: "pointer",
              background: lang === l.key
                ? (l.key === "ar" ? "rgba(245,158,11,0.08)" : "rgba(124,58,237,0.06)")
                : "transparent",
              borderBottom: lang === l.key
                ? `2px solid ${l.key === "ar" ? "#f59e0b" : "#7c3aed"}`
                : "2px solid transparent",
              display: "flex", alignItems: "center", gap: "10px", transition: "all 0.15s",
            }}>
              <span style={{ fontSize: "18px" }}>{l.icon}</span>
              <div style={{ textAlign: "left" }}>
                <p style={{
                  fontSize: "13px", fontWeight: 600, marginBottom: "1px",
                  color: lang === l.key ? (isDark ? "#e5e5e5" : "#111") : (isDark ? "#737373" : "#6b7280"),
                }}>{l.label}</p>
                <p style={{ fontSize: "10px", color: isDark ? "#525252" : "#9ca3af" }}>{l.sub}</p>
              </div>
              {lang === l.key && (
                <div style={{
                  marginLeft: "auto", width: "7px", height: "7px", borderRadius: "50%",
                  background: l.key === "ar" ? "#f59e0b" : "#7c3aed",
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Arabic active banner */}
        {isAr && (
          <div style={{
            padding: "8px 24px", background: "rgba(245,158,11,0.07)",
            borderBottom: "1px solid rgba(245,158,11,0.18)",
            fontSize: "12px", color: "#f59e0b",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <span style={{ fontWeight: 700 }}>Arabic mode active</span>
            <span style={{ color: isDark ? "#737373" : "#9ca3af" }}>— editing Arabic (UAE dialect). Changes save to title_ar, excerpt_ar, content_ar.</span>
          </div>
        )}

        {/* Form body */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }} dir={isAr ? "rtl" : "ltr"}>
          {fetching ? (
            <div style={{ textAlign: "center", padding: "48px" }}>
              <Loader2 size={24} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>

              {/* ── ENGLISH fields ── */}
              {!isAr && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>Title (EN) *</label>
                    <input value={form.title} onChange={(e) => setForm(f => ({
                      ...f, title: e.target.value,
                      slug: post ? f.slug : autoSlug(e.target.value),
                    }))} style={inp} placeholder="How AI is changing content creation" />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>Slug</label>
                      <input value={form.slug} onChange={(e) => set("slug", e.target.value)}
                        style={inp} placeholder="how-ai-changing-content" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>Category</label>
                      <input value={form.category} onChange={(e) => set("category", e.target.value)}
                        style={inp} placeholder="AI, YouTube, Marketing" />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>Excerpt</label>
                    <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)}
                      rows={2} style={{ ...inp, resize: "vertical" as const, fontFamily: "inherit" }}
                      placeholder="Short description shown in blog listing..." />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>Content (HTML / Markdown)</label>
                    <textarea value={form.content} onChange={(e) => set("content", e.target.value)}
                      rows={10} style={{ ...inp, resize: "vertical" as const, fontFamily: "monospace", fontSize: "12px", lineHeight: 1.7 }}
                      placeholder="<h2>Heading</h2><p>Content here...</p>" />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>
                      Tags <span style={{ fontWeight: 400 }}>(comma separated)</span>
                    </label>
                    <input value={form.tags} onChange={(e) => set("tags", e.target.value)}
                      style={inp} placeholder="ai, youtube, automation, content" />
                  </div>

                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px", background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: "9px",
                    marginBottom: "12px",
                  }}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text }}>Published</p>
                      <p style={{ fontSize: "11px", color: colors.textMuted }}>
                        {form.isPublished ? "Visible on website" : "Draft — not visible yet"}
                      </p>
                    </div>
                    <button onClick={() => set("isPublished", !form.isPublished)} style={{
                      width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer",
                      background: form.isPublished ? "#7c3aed" : colors.border, position: "relative", transition: "background 0.2s",
                    }}>
                      <div style={{
                        width: "18px", height: "18px", borderRadius: "50%", background: "white",
                        position: "absolute", top: "3px",
                        left: form.isPublished ? "23px" : "3px", transition: "left 0.2s",
                      }} />
                    </button>
                  </div>
                </>
              )}

              {/* ── ARABIC fields ── */}
              {isAr && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: isDark ? "#a3a3a3" : "#6b7280", marginBottom: "5px" }}>
                      العنوان (عربي) — Title
                    </label>
                    <input value={form.title_ar} onChange={(e) => set("title_ar", e.target.value)}
                      style={inp} dir="rtl" placeholder="كيف يغير الذكاء الاصطناعي إنشاء المحتوى..." />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: isDark ? "#a3a3a3" : "#6b7280", marginBottom: "5px" }}>
                      المقتطف (عربي) — Excerpt
                    </label>
                    <textarea value={form.excerpt_ar} onChange={(e) => set("excerpt_ar", e.target.value)}
                      rows={2} dir="rtl" style={{ ...inp, resize: "vertical" as const, fontFamily: "inherit" }}
                      placeholder="وصف قصير يظهر في قائمة المدونة..." />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: isDark ? "#a3a3a3" : "#6b7280", marginBottom: "5px" }}>
                      المحتوى بالعربي (HTML) — Content
                    </label>
                    <textarea value={form.content_ar} onChange={(e) => set("content_ar", e.target.value)}
                      rows={14} dir="rtl" style={{ ...inp, resize: "vertical" as const, fontFamily: "monospace", fontSize: "12px", lineHeight: 1.7 }}
                      placeholder="<h2>عنوان</h2><p>محتوى المقال هنا...</p>" />
                  </div>

                  <div style={{
                    padding: "10px 14px", borderRadius: "9px",
                    background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)",
                    fontSize: "12px", color: isDark ? "#a3a3a3" : "#6b7280", marginBottom: "8px",
                  }}>
                    Slug, category, and tags are shared across languages (set in the English tab).
                  </div>
                </>
              )}

              {error && (
                <p style={{ fontSize: "12px", color: "#ef4444", padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: "7px" }}>{error}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${panelBorder}`, display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer",
            border: `1px solid ${panelBorder}`, background: "transparent",
            color: isDark ? "#a3a3a3" : "#4b5563", fontSize: "13px",
          }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || fetching} style={{
            flex: 2, padding: "10px", borderRadius: "8px",
            cursor: saving ? "not-allowed" : "pointer",
            background: isAr
              ? "linear-gradient(135deg, #d97706, #b45309)"
              : "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white", border: "none", fontSize: "13px", fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
            {saving ? "Saving..." : isAr ? "حفظ المحتوى العربي" : (post ? "Save Changes" : "Publish Post")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main CMS Page ─────────────────────────────────────────────
export function CmsPage() {
  const { colors, isDark } = useTheme();
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

  const deletePost = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await api.delete(`/cms/admin/blog/${id}`);
      toast.success('Deleted successfully');
      fetchData();
    } catch {}
  };

  const totalPages = Math.ceil(total / limit);

  const inputStyle = {
    padding: "8px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none",
  };

  const filteredPosts = posts.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>Content CMS</h1>
          <p style={{ fontSize: "14px", color: colors.textMuted }}>Manage blog posts and website pages.</p>
        </div>
        {tab === "blog" && (
          <button onClick={() => { setEditPost(undefined); setShowBlogModal(true); }} style={{
            display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px",
            borderRadius: "8px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600,
            boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
          }}>
            <Plus size={15} /> New Post
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "2px", marginBottom: "16px", background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "10px", padding: "4px", width: "fit-content" }}>
        {(["blog", "pages"] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }} style={{
            padding: "7px 20px", borderRadius: "7px", fontSize: "13px",
            fontWeight: tab === t ? 600 : 400, cursor: "pointer", border: "none",
            background: tab === t ? (isDark ? "#1a1a1a" : "#ffffff") : "transparent",
            color: tab === t ? colors.text : colors.textMuted,
            boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
          }}>
            {t === "blog" ? "📝 Blog Posts" : "📄 Pages"}
          </button>
        ))}
      </div>

      {/* ── BLOG TAB ── */}
      {tab === "blog" && (
        <>
          <div style={{
            display: "flex", gap: "10px", marginBottom: "14px", alignItems: "center",
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: "10px", padding: "12px 16px",
          }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={13} color={colors.textMuted} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts..." style={{ ...inputStyle, width: "100%", paddingLeft: "30px", boxSizing: "border-box" as const }} />
            </div>
            <span style={{ fontSize: "12px", color: colors.textMuted }}>{total} posts</span>
          </div>

          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 100px 80px 90px 100px",
              gap: "10px", padding: "10px 18px",
              background: colors.bg, borderBottom: `1px solid ${colors.border}`,
            }}>
              {["Title", "Category", "Status", "Date", "Actions"].map(h => (
                <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: colors.textMuted }}>{h}</span>
              ))}
            </div>

            {loading ? (
              <div style={{ padding: "60px", textAlign: "center" }}>
                <Loader2 size={22} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div style={{ padding: "60px", textAlign: "center" }}>
                <BookOpen size={32} color={colors.textMuted} style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: "14px", color: colors.textMuted, marginBottom: "16px" }}>No blog posts yet</p>
                <button onClick={() => { setEditPost(undefined); setShowBlogModal(true); }} style={{
                  display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px",
                  borderRadius: "8px", background: "#7c3aed", color: "white",
                  border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                }}>
                  <Plus size={13} /> Write first post
                </button>
              </div>
            ) : (
              filteredPosts.map((post, i) => (
                <div key={post._id} style={{
                  display: "grid", gridTemplateColumns: "1fr 100px 80px 90px 100px",
                  gap: "10px", padding: "12px 18px", alignItems: "center",
                  borderBottom: i < filteredPosts.length - 1 ? `1px solid ${colors.border}` : "none",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = colors.bg; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {post.title}
                      </p>
                      {post.title_ar && (
                        <span style={{
                          fontSize: "9px", fontWeight: 700, padding: "1px 5px",
                          borderRadius: "4px", background: "rgba(245,158,11,0.12)",
                          color: "#f59e0b", flexShrink: 0,
                        }}>🇦🇪 AR</span>
                      )}
                    </div>
                    <p style={{ fontSize: "11px", color: colors.textMuted }}>/{post.slug}</p>
                  </div>
                  <span style={{ fontSize: "11px", color: colors.textMuted }}>{post.category || "—"}</span>
                  <span style={{
                    fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "9999px",
                    background: post.isPublished ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.1)",
                    color: post.isPublished ? "#22c55e" : "#6b7280",
                    display: "inline-block",
                  }}>
                    {post.isPublished ? "Live" : "Draft"}
                  </span>
                  <p style={{ fontSize: "11px", color: colors.textMuted }}>
                    {new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={() => { setEditPost(post); setShowBlogModal(true); }} style={{
                      width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer",
                      border: "1px solid rgba(124,58,237,0.2)", background: "rgba(124,58,237,0.06)",
                      color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => deletePost(post._id)} style={{
                      width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer",
                      border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
                      color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
              <p style={{ fontSize: "12px", color: colors.textMuted }}>
                {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                  width: "30px", height: "30px", borderRadius: "7px", cursor: page === 1 ? "not-allowed" : "pointer",
                  border: `1px solid ${colors.border}`, background: colors.bgCard, color: colors.text,
                  display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.4 : 1,
                }}>
                  <ChevronLeft size={13} />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                  width: "30px", height: "30px", borderRadius: "7px", cursor: page === totalPages ? "not-allowed" : "pointer",
                  border: `1px solid ${colors.border}`, background: colors.bgCard, color: colors.text,
                  display: "flex", alignItems: "center", justifyContent: "center", opacity: page === totalPages ? 0.4 : 1,
                }}>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── PAGES TAB ── */}
      {tab === "pages" && (
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${colors.border}` }}>
            <p style={{ fontSize: "13px", color: colors.textMuted }}>
              Edit website page content. Changes are live immediately after saving.
            </p>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <Loader2 size={22} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
            </div>
          ) : pages.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: colors.textMuted }}>No pages found.</p>
            </div>
          ) : (
            pages.map((p, i) => (
              <div key={p.slug} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: i < pages.length - 1 ? `1px solid ${colors.border}` : "none",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = colors.bg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "8px",
                    background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Globe size={15} color="#a78bfa" />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text, textTransform: "capitalize" }}>
                      {p.title || p.slug}
                    </p>
                    <p style={{ fontSize: "11px", color: colors.textMuted }}>
                      /{p.slug}
                      {p.updatedAt && ` · Last updated ${new Date(p.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                      {p.lastUpdatedBy && ` by ${p.lastUpdatedBy}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setEditPage(p); setShowPageModal(true); }} style={{
                  display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px",
                  borderRadius: "7px", cursor: "pointer",
                  border: "1px solid rgba(124,58,237,0.2)", background: "rgba(124,58,237,0.06)",
                  color: "#a78bfa", fontSize: "12px", fontWeight: 500,
                }}>
                  <Pencil size={12} /> Edit
                </button>
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
          colors={colors}
          isDark={isDark}
        />
      )}

      {/* Page edit modal */}
      {showPageModal && editPage && (
        <PageEditModal
          page={editPage}
          onClose={() => { setShowPageModal(false); setEditPage(undefined); }}
          onSave={fetchData}
          colors={colors}
          isDark={isDark}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}