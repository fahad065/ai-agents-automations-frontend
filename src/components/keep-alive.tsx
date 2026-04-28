"use client";
import { useEffect } from "react";

export function KeepAlive() {
  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || "https://api.logicmate.io/api/v1";
    const ping = async () => {
      try { await fetch(`${API}/health`); } catch {}
    };
    ping();
    const interval = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return null;
}