"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Copy, Check, CreditCard, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const BANK_DETAILS = {
  bankName: "Emirates NBD",       // ← replace with your bank
  accountName: "Fahad Abdul Faheem",    // ← replace with your name
  accountNumber: "1015821777301", // ← replace with your account
  iban: "AE720260001015821777301", // ← replace with your IBAN
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

  return (
    <div className="mx-auto max-w-[680px]">
      {/* Header */}
      <div className="mb-7">
        <h1 className="mb-1.5 text-[22px] font-bold text-foreground">
          Continue Your Subscription
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We're currently setting up our automated payment system. In the meantime,
          pay via bank transfer and we'll activate your account within 24 hours.
        </p>
      </div>

      {/* Notice banner */}
      <div className="mb-6 flex items-start gap-2.5 rounded-[10px] border border-[#f59e0b]/20 bg-[#f59e0b]/[0.08] px-4 py-3.5">
        <span className="shrink-0 text-lg">⚡</span>
        <p className="text-[13px] leading-relaxed text-[#f59e0b]">
          <strong>Temporary manual payment process.</strong> Our automated payment gateway
          is being set up. Once ready, you'll be able to pay instantly with a card.
          For now, bank transfer is the only option.
        </p>
      </div>

      {/* Step 1 — Choose plan */}
      <div className="mb-4 rounded-xl border bg-card p-5">
        <p className="mb-4 text-sm font-bold text-foreground">
          Step 1 — Choose your plan
        </p>
        <div className="flex flex-col gap-2.5">
          {PLANS.map((plan) => (
            <button
              key={plan.name}
              onClick={() => setSelectedPlan(plan.name)}
              className={cn(
                "flex items-center justify-between rounded-[10px] border-2 px-4 py-3.5 text-left transition-colors",
                selectedPlan === plan.name ? "border-primary bg-primary/[0.08]" : "border-border"
              )}
            >
              <div>
                <div className="mb-0.5 flex items-center gap-2">
                  <p className={cn("text-sm font-semibold", selectedPlan === plan.name ? "text-[#a78bfa]" : "text-foreground")}>
                    {plan.name}
                  </p>
                  {plan.badge && (
                    <span className="rounded-full bg-[#22c55e]/10 px-1.75 py-0.5 text-[10px] font-semibold text-[#22c55e]">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{plan.aed}</p>
              </div>
              <div className="text-right">
                <p className={cn("text-lg font-bold", selectedPlan === plan.name ? "text-[#a78bfa]" : "text-foreground")}>
                  {plan.price}
                </p>
                {selectedPlan === plan.name && <CheckCircle2 size={16} className="ml-auto text-primary" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 — Bank details */}
      <div className="mb-4 rounded-xl border bg-card p-5">
        <p className="mb-4 text-sm font-bold text-foreground">
          Step 2 — Transfer to this account
        </p>
        <div className="flex flex-col gap-2.5">
          {Object.entries(BANK_DETAILS).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between rounded-lg border bg-background px-3.5 py-2.5">
              <div>
                <p className="mb-0.5 text-[11px] text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {value}
                </p>
              </div>
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(value, key)} className={copied === key ? "text-[#22c55e]" : "text-muted-foreground"}>
                {copied === key ? <Check size={13} /> : <Copy size={13} />}
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-primary/15 bg-primary/6 px-3.5 py-2.5">
          <p className="text-xs leading-relaxed text-[#a78bfa]">
            💡 Please include your email <strong>{user?.email}</strong> in the transfer reference/notes
            so we can identify your payment quickly.
          </p>
        </div>
      </div>

      {/* Step 3 — Notify us */}
      <div className="mb-4 rounded-xl border bg-card p-5">
        <p className="mb-4 text-sm font-bold text-foreground">
          Step 3 — Notify us after payment
        </p>

        {sent ? (
          <div className="rounded-[10px] border border-[#22c55e]/20 bg-[#22c55e]/[0.08] p-6 text-center">
            <CheckCircle2 size={32} className="mx-auto mb-3 text-[#22c55e]" />
            <p className="mb-1.5 text-[15px] font-semibold text-[#22c55e]">
              Payment notification sent!
            </p>
            <p className="text-[13px] text-muted-foreground">
              We'll verify and activate your account within 24 hours.
              You'll receive a confirmation email at <strong>{user?.email}</strong>.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <Label className="mb-1.5 text-xs font-medium text-muted-foreground">
                Transaction Reference Number *
              </Label>
              <Input
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. TXN123456789"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-medium text-muted-foreground">
                Additional Notes (optional)
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any additional information..."
              />
            </div>
            <Button onClick={handleNotifyPayment} disabled={sending} className="gap-2">
              <Mail size={15} />
              {sending ? "Sending..." : "Notify us — I've paid"}
            </Button>
          </div>
        )}
      </div>

      {/* Help */}
      <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
        <CreditCard size={18} className="shrink-0 text-muted-foreground" />
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Questions? Email us at{" "}
          <a href="mailto:hello@logicmate.io" className="text-[#a78bfa] no-underline">
            hello@logicmate.io
          </a>
          {" "}and we'll get back to you within a few hours.
        </p>
      </div>
    </div>
  );
}
