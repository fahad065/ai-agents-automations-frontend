"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import { Check, X, Loader2, ExternalLink } from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import { toast } from "sonner";

interface YouTubeStatus {
  connected: boolean;
  channelTitle?: string;
  channelId?: string;
  expiresAt?: string;
}

export function YouTubeConnectButton({ colors }: { colors: any }) {
  const { accessToken } = useAuthStore();
  const [status, setStatus] = useState<YouTubeStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetchStatus();

    // Check URL params after OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const youtubeStatus = params.get("youtube");
    if (youtubeStatus === "connected") {
      toast.success("YouTube channel connected successfully!");
      fetchStatus();
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (youtubeStatus === "error") {
      toast.error("Failed to connect YouTube. Please try again.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (youtubeStatus === "denied") {
      toast.error("YouTube connection was cancelled.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/youtube/status");
      setStatus(res.data);
    } catch {}
    setLoading(false);
  };

  const handleConnect = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.logicmate.io/api/v1";
    window.location.href = `${apiUrl}/auth/youtube/connect?token=${accessToken}`;
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect your YouTube channel?")) return;
    setDisconnecting(true);
    try {
      await api.delete("/auth/youtube/disconnect");
      setStatus({ connected: false });
      toast.success("YouTube channel disconnected");
    } catch {
      toast.error("Failed to disconnect");
    }
    setDisconnecting(false);
  };

  if (loading) {
    return (
      <div style={{
        padding: "12px 16px", borderRadius: "9px",
        border: `1px solid ${colors.border}`, background: colors.bg,
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <Loader2 size={14} color={colors.textMuted} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "13px", color: colors.textMuted }}>Checking YouTube connection...</span>
      </div>
    );
  }

  if (status.connected) {
    return (
      <div style={{
        padding: "12px 16px", borderRadius: "9px",
        border: "1px solid rgba(34,197,94,0.2)",
        background: "rgba(34,197,94,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FaYoutube size={15} color="#ef4444" />
          </div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>
              {status.channelTitle || "YouTube Connected"}
            </p>
            <p style={{ fontSize: "11px", color: "#22c55e" }}>
              ✓ Channel connected — ready to upload
            </p>
          </div>
        </div>
        <button onClick={handleDisconnect} disabled={disconnecting} style={{
          display: "flex", alignItems: "center", gap: "5px",
          padding: "5px 10px", borderRadius: "6px", cursor: "pointer",
          border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
          color: "#ef4444", fontSize: "11px", fontWeight: 500,
        }}>
          {disconnecting ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : <X size={11} />}
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: "14px 16px", borderRadius: "9px",
      border: "1px solid rgba(239,68,68,0.2)",
      background: "rgba(239,68,68,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
        <FaYoutube size={15} color="#ef4444" style={{ marginTop: "2px", flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>
            Connect YouTube Channel
          </p>
          <p style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.5 }}>
            Required for auto-upload. Click below to connect your YouTube channel via Google OAuth.
            We only request upload permissions.
          </p>
        </div>
      </div>
      <button onClick={handleConnect} style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "9px 16px", borderRadius: "8px", cursor: "pointer",
        background: "#ef4444", color: "white", border: "none",
        fontSize: "13px", fontWeight: 600,
        boxShadow: "0 4px 12px rgba(239,68,68,0.25)",
      }}>
        <FaYoutube size={14} />
        Connect YouTube Channel
        <ExternalLink size={12} />
      </button>
      <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "8px" }}>
        You can still run the pipeline without connecting — video will be saved locally until connected.
      </p>
    </div>
  );
}