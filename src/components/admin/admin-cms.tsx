"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import { Save, Loader2, CheckCircle2, Plus, Pencil, Trash2, Eye } from "lucide-react";
import Link from "next/link";

const PAGES = [
  { slug: "about", label: "About" },
  { slug: "contact", label: "Contact" },
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "terms", label: "Terms of Service" },
  { slug: "cookies", label: "Cookie Policy" },
  { slug: "faq", label: "FAQ" },
];

export function AdminCmsPage() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<"pages" | "blog">("pages");
  const [selectedPage, setSelectedPage] = useState("about");
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "", excerpt: "", content: "",
    category: "tutorial", tags: "", isPublished: false,
  });
  const [postSaving, setPostSaving] = useState(false);

  useEffect(() => {
    if (activeTab === "pages") fetchPage(selectedPage);
    else fetchBlogPosts();
  }, [activeTab, selectedPage]);

  const fetchPage = async (slug: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/cms/admin/pages/${slug}`);
      setPageData(res.data);
    } catch {}
    setLoading(false);
  };

  const fetchBlogPosts = async () => {
    setBlogLoading(true);
    try {
      const res = await api.get("/cms/admin/blog");
      setBlogPosts(res.data.posts || []);
    } catch {}
    setBlogLoading(false);
  };

  const savePage = async () => {
    setSaving(true);
    try {
      await api.put(`/cms/admin/pages/${selectedPage}`, pageData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const createPost = async () => {
    setPostSaving(true);
    try {
      await api.post("/cms/admin/blog", {
        ...newPost,
        tags: newPost.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setShowNewPost(false);
      setNewPost({ title: "", excerpt: "", content: "", category: "tutorial", tags: "", isPublished: false });
      fetchBlogPosts();
    } catch {}
    setPostSaving(false);
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/cms/admin/blog/${id}`);
      fetchBlogPosts();
    } catch {}
  };

  const togglePublish = async (post: any) => {
    try {
      await api.put(`/cms/admin/blog/${post._id}`, { isPublished: !post.isPublished });
      fetchBlogPosts();
    } catch {}
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px",
    borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`,
    background: colors.bg, color: colors.text,
    boxSizing: "border-box" as const, outline: "none",
    marginBottom: "10px",
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>
          Content Management
        </h1>
        <p style={{ fontSize: "14px", color: colors.textMuted }}>
          Edit website pages and manage blog posts.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px" }}>
        {[
          { id: "pages", label: "Pages" },
          { id: "blog", label: "Blog posts" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "8px 20px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 500,
              cursor: "pointer", transition: "all 0.2s",
              border: `1px solid ${activeTab === tab.id ? "rgba(124,58,237,0.3)" : colors.border}`,
              background: activeTab === tab.id ? "rgba(124,58,237,0.1)" : "transparent",
              color: activeTab === tab.id ? "#a78bfa" : colors.textMuted,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pages tab */}
      {activeTab === "pages" && (
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "20px" }}>
          {/* Page list */}
          <div style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: "10px", overflow: "hidden",
            alignSelf: "start",
          }}>
            {PAGES.map((page, i) => (
              <button
                key={page.slug}
                onClick={() => setSelectedPage(page.slug)}
                style={{
                  width: "100%", padding: "12px 16px",
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  background: selectedPage === page.slug
                    ? "rgba(124,58,237,0.1)" : "transparent",
                  border: "none",
                  borderBottom: i < PAGES.length - 1 ? `1px solid ${colors.border}` : "none",
                  cursor: "pointer",
                  color: selectedPage === page.slug ? "#a78bfa" : colors.textMuted,
                  fontSize: "13px", fontWeight: selectedPage === page.slug ? 500 : 400,
                  textAlign: "left",
                }}
              >
                {page.label}
                <Link
                  href={`/${page.slug}`}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: colors.textMuted }}
                >
                  <Eye size={12} />
                </Link>
              </button>
            ))}
          </div>

          {/* Page editor */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px" }}>
              <Loader2 size={24} color="#7c3aed"
                style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
            </div>
          ) : pageData ? (
            <div style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px", padding: "24px",
            }}>
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: "20px",
              }}>
                <h2 style={{ fontSize: "15px", fontWeight: 600, color: colors.text }}>
                  Editing: {PAGES.find((p) => p.slug === selectedPage)?.label}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {saved && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#22c55e" }}>
                      <CheckCircle2 size={14} /> Saved
                    </div>
                  )}
                  <button
                    onClick={savePage}
                    disabled={saving}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "8px 18px", borderRadius: "8px",
                      background: "#7c3aed", color: "white",
                      border: "none", cursor: "pointer",
                      fontSize: "13px", fontWeight: 600,
                    }}
                  >
                    {saving
                      ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                      : <Save size={13} />
                    }
                    Save
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "4px" }}>
                    Title
                  </label>
                  <input
                    value={pageData.title || ""}
                    onChange={(e) => setPageData((p: any) => ({ ...p, title: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "4px" }}>
                    Subtitle
                  </label>
                  <input
                    value={pageData.subtitle || ""}
                    onChange={(e) => setPageData((p: any) => ({ ...p, subtitle: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "4px" }}>
                    Meta title (SEO)
                  </label>
                  <input
                    value={pageData.metaTitle || ""}
                    onChange={(e) => setPageData((p: any) => ({ ...p, metaTitle: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "4px" }}>
                    Meta description (SEO)
                  </label>
                  <input
                    value={pageData.metaDescription || ""}
                    onChange={(e) => setPageData((p: any) => ({ ...p, metaDescription: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "4px" }}>
                  Content (HTML)
                </label>
                <textarea
                  value={pageData.content || ""}
                  onChange={(e) => setPageData((p: any) => ({ ...p, content: e.target.value }))}
                  rows={16}
                  style={{ ...inputStyle, fontFamily: "monospace", fontSize: "12px", resize: "vertical" as const }}
                />
              </div>

              {/* FAQ items editor */}
              {selectedPage === "faq" && pageData.faqItems && (
                <div style={{ marginTop: "16px" }}>
                  <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "8px" }}>
                    FAQ Items ({pageData.faqItems.length})
                  </label>
                  {pageData.faqItems.map((item: any, i: number) => (
                    <div key={i} style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "8px", padding: "12px",
                      marginBottom: "8px",
                    }}>
                      <input
                        value={item.question}
                        onChange={(e) => {
                          const items = [...pageData.faqItems];
                          items[i] = { ...items[i], question: e.target.value };
                          setPageData((p: any) => ({ ...p, faqItems: items }));
                        }}
                        placeholder="Question"
                        style={{ ...inputStyle, marginBottom: "6px" }}
                      />
                      <textarea
                        value={item.answer}
                        onChange={(e) => {
                          const items = [...pageData.faqItems];
                          items[i] = { ...items[i], answer: e.target.value };
                          setPageData((p: any) => ({ ...p, faqItems: items }));
                        }}
                        placeholder="Answer"
                        rows={2}
                        style={{ ...inputStyle, resize: "vertical" as const }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => setPageData((p: any) => ({
                      ...p,
                      faqItems: [...p.faqItems, { question: "", answer: "", order: p.faqItems.length + 1 }],
                    }))}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "8px 14px", borderRadius: "8px",
                      border: `1px solid ${colors.border}`,
                      background: "none", color: colors.textMuted,
                      cursor: "pointer", fontSize: "12px",
                    }}
                  >
                    <Plus size={13} /> Add FAQ item
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Blog tab */}
      {activeTab === "blog" && (
        <div>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: "16px",
          }}>
            <p style={{ fontSize: "14px", color: colors.textMuted }}>
              {blogPosts.length} posts
            </p>
            <button
              onClick={() => setShowNewPost(!showNewPost)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "9px 18px", borderRadius: "8px",
                background: "#7c3aed", color: "white",
                border: "none", cursor: "pointer",
                fontSize: "13px", fontWeight: 600,
              }}
            >
              <Plus size={14} /> New post
            </button>
          </div>

          {/* New post form */}
          {showNewPost && (
            <div style={{
              background: colors.bgCard,
              border: "1px solid rgba(124,58,237,0.3)",
              borderRadius: "12px", padding: "20px",
              marginBottom: "20px",
            }}>
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: colors.text, marginBottom: "14px" }}>
                New blog post
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input value={newPost.title} onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))} placeholder="Post title *" style={inputStyle} />
                <select value={newPost.category} onChange={(e) => setNewPost((p) => ({ ...p, category: e.target.value }))} style={inputStyle}>
                  <option value="product">Product</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="case-study">Case study</option>
                  <option value="news">News</option>
                  <option value="tips">Tips</option>
                </select>
              </div>
              <input value={newPost.excerpt} onChange={(e) => setNewPost((p) => ({ ...p, excerpt: e.target.value }))} placeholder="Short excerpt" style={inputStyle} />
              <input value={newPost.tags} onChange={(e) => setNewPost((p) => ({ ...p, tags: e.target.value }))} placeholder="Tags (comma separated)" style={inputStyle} />
              <textarea value={newPost.content} onChange={(e) => setNewPost((p) => ({ ...p, content: e.target.value }))} placeholder="Content (HTML supported)" rows={10} style={{ ...inputStyle, fontFamily: "monospace", fontSize: "12px", resize: "vertical" as const }} />
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: colors.text }}>
                  <input type="checkbox" checked={newPost.isPublished} onChange={(e) => setNewPost((p) => ({ ...p, isPublished: e.target.checked }))} style={{ accentColor: "#7c3aed" }} />
                  Publish immediately
                </label>
                <button onClick={createPost} disabled={postSaving || !newPost.title} style={{ padding: "9px 20px", borderRadius: "8px", background: "#7c3aed", color: "white", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  {postSaving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={13} />}
                  Save post
                </button>
                <button onClick={() => setShowNewPost(false)} style={{ padding: "9px 16px", borderRadius: "8px", border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "13px" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Posts list */}
          {blogLoading ? (
            <div style={{ textAlign: "center", padding: "48px" }}>
              <Loader2 size={24} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
            </div>
          ) : blogPosts.length === 0 ? (
            <div style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px", padding: "48px", textAlign: "center",
            }}>
              <p style={{ color: colors.textMuted, marginBottom: "12px" }}>No blog posts yet</p>
              <button onClick={() => setShowNewPost(true)} style={{ padding: "9px 18px", borderRadius: "8px", background: "#7c3aed", color: "white", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                Create first post
              </button>
            </div>
          ) : (
            <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
              {blogPosts.map((post, i) => (
                <div key={post._id} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 20px",
                  borderBottom: i < blogPosts.length - 1 ? `1px solid ${colors.border}` : "none",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: colors.text, marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {post.title}
                    </p>
                    <div style={{ display: "flex", gap: "8px", fontSize: "11px", color: colors.textMuted }}>
                      <span>{post.category}</span>
                      <span>·</span>
                      <span>{post.readTimeMinutes} min</span>
                      <span>·</span>
                      <span>{post.viewCount} views</span>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePublish(post)}
                    style={{
                      fontSize: "11px", fontWeight: 600, padding: "3px 10px",
                      borderRadius: "9999px", cursor: "pointer", border: "none",
                      background: post.isPublished ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.1)",
                      color: post.isPublished ? "#22c55e" : colors.textMuted,
                    }}
                  >
                    {post.isPublished ? "Published" : "Draft"}
                  </button>
                  <Link href={`/blog/${post.slug}`} target="_blank" style={{ color: colors.textMuted }}>
                    <Eye size={14} />
                  </Link>
                  <button onClick={() => deletePost(post._id)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}