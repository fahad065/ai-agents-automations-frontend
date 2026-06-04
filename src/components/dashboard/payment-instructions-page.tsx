"use client";

import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Copy, Check, CreditCard, Mail, CheckCircle2 } from "lucide-react";

const BANK_DETAILS = {
  bankName: "Emirates NBD",       // ← replace with your bank
  accountName: "Fahad Faheem",    // ← replace with your name
  accountNumber: "XXXX-XXXX-XXXX", // ← replace with your account
  iban: "AE00 0000 0000 0000 000", // ← replace with your IBAN
  swiftCode: "EBILAEAD",          // ← replace with your SWIFT
  currency: "AED / USD",
};

const PLANS = [
  {
    name: "YouTube Agent — Monthly",
    price: "$49/mo",
    aed: "AED 180/mo",
    period: "monthly",
  },
  {
    name: "YouTube Agent — Annual",
    price: "$39/mo",
    aed: "AED 1,716/year",
    period: "annual",
    badge: "Save 20%",
  },
];

export function PaymentInstructionsPage() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [copied, setCopied] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("YouTube Agent — Monthly");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleNotifyPayment = async () => {
    if (!transactionRef.trim()) {
      toast.error("Please enter your transaction reference number");
      return;
    }
    setSending(true);
    try {
      await api.post("/users/notify-payment", {
        plan: selectedPlan,
        transactionRef,
        notes,
      });
      setSent(true);
      toast.success("Payment notification sent! We'll activate your account within 24 hours.");
    } catch {
      toast.error("Failed to send. Please email us directly at hello@logicmate.io");
    }
    setSending(false);
  };

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", boxSizing: "border-box" as const,
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: colors.text, marginBottom: "6px" }}>
          Continue Your Subscription
        </h1>
        <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.6 }}>
          We're currently setting up our automated payment system. In the meantime,
          pay via bank transfer and we'll activate your account within 24 hours.
        </p>
      </div>

      {/* Notice banner */}
      <div style={{
        background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: "10px", padding: "14px 16px", marginBottom: "24px",
        display: "flex", alignItems: "flex-start", gap: "10px",
      }}>
        <span style={{ fontSize: "18px", flexShrink: 0 }}>⚡</span>
        <p style={{ fontSize: "13px", color: "#f59e0b", lineHeight: 1.6 }}>
          <strong>Temporary manual payment process.</strong> Our automated payment gateway
          is being set up. Once ready, you'll be able to pay instantly with a card.
          For now, bank transfer is the only option.
        </p>
      </div>

      {/* Step 1 — Choose plan */}
      <div style={{
        background: colors.bgCard, border: `1px solid ${colors.border}`,
        borderRadius: "12px", padding: "20px", marginBottom: "16px",
      }}>
        <p style={{ fontSize: "14px", fontWeight: 700, color: colors.text, marginBottom: "16px" }}>
          Step 1 — Choose your plan
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {PLANS.map((plan) => (
            <button key={plan.name} onClick={() => setSelectedPlan(plan.name)} style={{
              padding: "14px 16px", borderRadius: "10px", cursor: "pointer",
              textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between",
              border: `2px solid ${selectedPlan === plan.name ? "#7c3aed" : colors.border}`,
              background: selectedPlan === plan.name ? "rgba(124,58,237,0.08)" : "transparent",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: selectedPlan === plan.name ? "#a78bfa" : colors.text }}>
                    {plan.name}
                  </p>
                  {plan.badge && (
                    <span style={{
                      fontSize: "10px", padding: "2px 7px", borderRadius: "9999px",
                      background: "rgba(34,197,94,0.1)", color: "#22c55e", fontWeight: 600,
                    }}>
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "12px", color: colors.textMuted }}>{plan.aed}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "18px", fontWeight: 700, color: selectedPlan === plan.name ? "#a78bfa" : colors.text }}>
                  {plan.price}
                </p>
                {selectedPlan === plan.name && <CheckCircle2 size={16} color="#7c3aed" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 — Bank details */}
      <div style={{
        background: colors.bgCard, border: `1px solid ${colors.border}`,
        borderRadius: "12px", padding: "20px", marginBottom: "16px",
      }}>
        <p style={{ fontSize: "14px", fontWeight: 700, color: colors.text, marginBottom: "16px" }}>
          Step 2 — Transfer to this account
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Object.entries(BANK_DETAILS).map(([key, value]) => (
            <div key={key} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderRadius: "8px",
              background: colors.bg, border: `1px solid ${colors.border}`,
            }}>
              <div>
                <p style={{ fontSize: "11px", color: colors.textMuted, textTransform: "capitalize", marginBottom: "2px" }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text, fontFamily: "monospace" }}>
                  {value}
                </p>
              </div>
              <button onClick={() => copyToClipboard(value, key)} style={{
                width: "32px", height: "32px", borderRadius: "7px", cursor: "pointer",
                border: `1px solid ${colors.border}`, background: "transparent",
                color: copied === key ? "#22c55e" : colors.textMuted,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {copied === key ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: "12px", padding: "10px 14px", borderRadius: "8px",
          background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)",
        }}>
          <p style={{ fontSize: "12px", color: "#a78bfa", lineHeight: 1.6 }}>
            💡 Please include your email <strong>{user?.email}</strong> in the transfer reference/notes
            so we can identify your payment quickly.
          </p>
        </div>
      </div>

      {/* Step 3 — Notify us */}
      <div style={{
        background: colors.bgCard, border: `1px solid ${colors.border}`,
        borderRadius: "12px", padding: "20px", marginBottom: "16px",
      }}>
        <p style={{ fontSize: "14px", fontWeight: 700, color: colors.text, marginBottom: "16px" }}>
          Step 3 — Notify us after payment
        </p>

        {sent ? (
          <div style={{
            padding: "24px", borderRadius: "10px", textAlign: "center",
            background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
          }}>
            <CheckCircle2 size={32} color="#22c55e" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#22c55e", marginBottom: "6px" }}>
              Payment notification sent!
            </p>
            <p style={{ fontSize: "13px", color: colors.textMuted }}>
              We'll verify and activate your account within 24 hours.
              You'll receive a confirmation email at <strong>{user?.email}</strong>.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>
                Transaction Reference Number *
              </label>
              <input
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                style={inp}
                placeholder="e.g. TXN123456789"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>
                Additional Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{ ...inp, resize: "vertical" as const }}
                placeholder="Any additional information..."
              />
            </div>
            <button onClick={handleNotifyPayment} disabled={sending} style={{
              padding: "12px", borderRadius: "9px", cursor: sending ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "white", border: "none", fontSize: "14px", fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              opacity: sending ? 0.7 : 1,
            }}>
              <Mail size={15} />
              {sending ? "Sending..." : "Notify us — I've paid"}
            </button>
          </div>
        )}
      </div>

      {/* Help */}
      <div style={{
        padding: "16px", borderRadius: "10px",
        background: colors.bgCard, border: `1px solid ${colors.border}`,
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <CreditCard size={18} color={colors.textMuted} style={{ flexShrink: 0 }} />
        <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6 }}>
          Questions? Email us at{" "}
          <a href="mailto:hello@logicmate.io" style={{ color: "#a78bfa", textDecoration: "none" }}>
            hello@logicmate.io
          </a>
          {" "}and we'll get back to you within a few hours.
        </p>
      </div>
    </div>
  );
}