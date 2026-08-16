"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import { X, Loader2, ExternalLink } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { toast } from "sonner";

interface InstagramStatus {
  connected: boolean;
  username?: string;
  accountId?: string;
  expired?: boolean;
}

export function InstagramConnectButton({
  colors,
  compact = false,
}: {
  colors: any;
  compact?: boolean;
}) {
  const { accessToken } = useAuthStore();
  const [status, setStatus] = useState<InstagramStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetchStatus();
    const params = new URLSearchParams(window.location.search);
    const ig = params.get("instagram");
    if (ig === "connected") {
      toast.success("Instagram account connected!");
      fetchStatus();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (ig === "error") {
      toast.error("Instagram connection failed. Try again.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (ig === "denied") {
      toast.error("Instagram connection cancelled.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/instagram/status");
      setStatus(res.data);
    } catch {}
    setLoading(false);
  };

  const handleConnect = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.logicmate.io/api/v1";
    window.location.href = `${apiUrl}/auth/instagram/connect?token=${accessToken}`;
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Instagram account?")) return;
    setDisconnecting(true);
    try {
      await api.delete("/auth/instagram/disconnect");
      setStatus({ connected: false });
      toast.success("Instagram disconnected");
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
        <FaInstagram size={compact ? 12 : 14} color="#e1306c" />
        <span style={{ fontSize: compact ? "11px" : "12px", color: "#22c55e", fontWeight: 500, flex: 1 }}>
          {status.username ? `@${status.username}` : "Instagram"} connected ✓
          {status.expired && (
            <span style={{ color: "#f59e0b", marginLeft: "6px", fontSize: "10px" }}>
              (token expired — reconnect)
            </span>
          )}
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
        border: "1px solid rgba(225,48,108,0.3)",
        background: "rgba(225,48,108,0.06)",
        color: "#e1306c", fontSize: "11px", fontWeight: 600, width: "100%",
        justifyContent: "center",
      }}>
        <FaInstagram size={12} />
        Connect Instagram
        <ExternalLink size={10} />
      </button>
    );
  }

  return (
    <div style={{
      padding: "12px 14px", borderRadius: "9px",
      border: "1px solid rgba(225,48,108,0.2)",
      background: "rgba(225,48,108,0.04)",
    }}>
      <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "8px", lineHeight: 1.5 }}>
        Connect your Instagram Business account to enable auto-upload.
      </p>
      <button onClick={handleConnect} style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "8px 14px", borderRadius: "7px", cursor: "pointer",
        background: "linear-gradient(135deg, #e1306c, #c13584)",
        color: "white", border: "none",
        fontSize: "12px", fontWeight: 600,
      }}>
        <FaInstagram size={13} />
        Connect Instagram Account
        <ExternalLink size={11} />
      </button>
    </div>
  );
}
