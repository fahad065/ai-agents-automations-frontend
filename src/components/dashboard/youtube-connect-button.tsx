"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import { X, Loader2, ExternalLink } from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import { toast } from "sonner";

interface YouTubeStatus {
  connected: boolean;
  channelTitle?: string;
  channelId?: string;
}

export function YouTubeConnectButton({
  colors,
  compact = false,
}: {
  colors: any;
  compact?: boolean;
}) {
  const { accessToken } = useAuthStore();
  const [status, setStatus] = useState<YouTubeStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetchStatus();
    const params = new URLSearchParams(window.location.search);
    const yt = params.get("youtube");
    if (yt === "connected") {
      toast.success("YouTube channel connected!");
      fetchStatus();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (yt === "error") {
      toast.error("YouTube connection failed. Try again.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (yt === "denied") {
      toast.error("YouTube connection cancelled.");
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
    if (!confirm("Disconnect YouTube channel?")) return;
    setDisconnecting(true);
    try {
      await api.delete("/auth/youtube/disconnect");
      setStatus({ connected: false });
      toast.success("YouTube disconnected");
    } catch {
      toast.error("Failed to disconnect");
    }
    setDisconnecting(false);
  };

  if (loading) {
    return (
      <div style={{
        padding: compact ? "6px 10px" : "10px 14px",
        borderRadius: "8px", border: `1px solid ${colors.border}`,
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        <Loader2 size={12} color={colors.textMuted} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "12px", color: colors.textMuted }}>Checking...</span>
      </div>
    );
  }

  if (status.connected) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: compact ? "6px 10px" : "10px 14px",
        borderRadius: "8px",
        border: "1px solid rgba(34,197,94,0.25)",
        background: "rgba(34,197,94,0.05)",
      }}>
        <FaYoutube size={compact ? 12 : 14} color="#ef4444" />
        <span style={{ fontSize: compact ? "11px" : "12px", color: "#22c55e", fontWeight: 500, flex: 1 }}>
          {status.channelTitle || "YouTube"} connected ✓
        </span>
        <button onClick={handleDisconnect} disabled={disconnecting} style={{
          background: "none", border: "none", cursor: "pointer",
          color: colors.textMuted, padding: "0", display: "flex",
        }}>
          {disconnecting
            ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} />
            : <X size={11} />}
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <button onClick={handleConnect} style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "6px 10px", borderRadius: "7px", cursor: "pointer",
        border: "1px solid rgba(239,68,68,0.3)",
        background: "rgba(239,68,68,0.06)",
        color: "#ef4444", fontSize: "11px", fontWeight: 600, width: "100%",
        justifyContent: "center",
      }}>
        <FaYoutube size={12} />
        Connect YouTube
        <ExternalLink size={10} />
      </button>
    );
  }

  return (
    <div style={{
      padding: "12px 14px", borderRadius: "9px",
      border: "1px solid rgba(239,68,68,0.2)",
      background: "rgba(239,68,68,0.04)",
    }}>
      <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "8px", lineHeight: 1.5 }}>
        Connect your YouTube channel to enable auto-upload.
      </p>
      <button onClick={handleConnect} style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "8px 14px", borderRadius: "7px", cursor: "pointer",
        background: "#ef4444", color: "white", border: "none",
        fontSize: "12px", fontWeight: 600,
      }}>
        <FaYoutube size={13} />
        Connect YouTube Channel
        <ExternalLink size={11} />
      </button>
    </div>
  );
}