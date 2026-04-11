"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { CmsPage } from "./cms-page";
import { Mail, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { FaTwitter } from "react-icons/fa";

interface ContactInfo {
  email: string;
  supportEmail: string;
  twitter: string;
  linkedin: string;
  address: string;
}

export function ContactPage() {
  const { colors } = useTheme();
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    fetch(`${apiUrl}/cms/pages/contact`)
      .then((r) => r.json())
      .then((data) => setContactInfo(data.contactInfo))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }
    setSending(true);
    setError("");
    // Simulate send — wire up to email service when ready
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setSending(false);
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    borderRadius: "8px", fontSize: "14px",
    border: `1px solid ${colors.border}`,
    background: colors.bg, color: colors.text,
    outline: "none", boxSizing: "border-box" as const,
    marginBottom: "12px",
  };

  return (
    <CmsPage title="Contact us" subtitle="We would love to hear from you" maxWidth="900px">
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "48px",
      }}>
        {/* Contact info */}
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: colors.text, marginBottom: "20px" }}>
            Get in touch
          </h2>
          <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "28px" }}>
            Whether you have a question about our automations, need technical
            support, or want to explore a partnership — we are here to help.
            We aim to respond within 24 hours on business days.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {contactInfo?.email && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Mail size={16} color="#a78bfa" />
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: colors.textMuted }}>General enquiries</p>
                  <a href={`mailto:${contactInfo.email}`} style={{ fontSize: "14px", color: "#a78bfa", textDecoration: "none" }}>
                    {contactInfo.email}
                  </a>
                </div>
              </div>
            )}

            {contactInfo?.supportEmail && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Mail size={16} color="#22c55e" />
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: colors.textMuted }}>Technical support</p>
                  <a href={`mailto:${contactInfo.supportEmail}`} style={{ fontSize: "14px", color: "#22c55e", textDecoration: "none" }}>
                    {contactInfo.supportEmail}
                  </a>
                </div>
              </div>
            )}

            {contactInfo?.twitter && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <FaTwitter size={16} color="#3b82f6" />
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: colors.textMuted }}>Twitter / X</p>
                  <a href={contactInfo.twitter} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "#3b82f6", textDecoration: "none" }}>
                    @nexagent
                  </a>
                </div>
              </div>
            )}

            {contactInfo?.address && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <MapPin size={16} color="#f59e0b" />
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: colors.textMuted }}>Location</p>
                  <p style={{ fontSize: "14px", color: colors.text }}>{contactInfo.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact form */}
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: colors.text, marginBottom: "20px" }}>
            Send a message
          </h2>

          {sent ? (
            <div style={{
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "12px", padding: "32px", textAlign: "center",
            }}>
              <CheckCircle2 size={40} color="#22c55e" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: "16px", fontWeight: 600, color: colors.text, marginBottom: "8px" }}>
                Message sent!
              </p>
              <p style={{ fontSize: "14px", color: colors.textMuted }}>
                We will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "8px", padding: "10px 14px",
                  fontSize: "13px", color: "#ef4444",
                  marginBottom: "12px",
                }}>
                  {error}
                </div>
              )}
              <input
                placeholder="Your name *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="Your email *"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                style={inputStyle}
              />
              <input
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                style={inputStyle}
              />
              <textarea
                placeholder="Your message *"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={5}
                style={{ ...inputStyle, resize: "vertical" as const }}
              />
              <button
                type="submit"
                disabled={sending}
                style={{
                  width: "100%", padding: "12px",
                  borderRadius: "8px", fontSize: "14px",
                  fontWeight: 600, cursor: sending ? "not-allowed" : "pointer",
                  background: sending
                    ? "rgba(124,58,237,0.5)"
                    : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "white", border: "none",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "8px",
                }}
              >
                {sending
                  ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                  : <Send size={15} />
                }
                {sending ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </CmsPage>
  );
}