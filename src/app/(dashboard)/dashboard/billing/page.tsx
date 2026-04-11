import type { Metadata } from "next";

export const metadata: Metadata = { title: "Billing — NexAgent" };

export default function BillingPage() {
  return (
    <div style={{ color: "white", padding: "20px" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
        Billing
      </h1>
      <p style={{ color: "#666" }}>Stripe billing integration — coming in Week 4.</p>
    </div>
  );
}