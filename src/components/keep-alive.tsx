"use client";
import { useEffect } from "react";

export function KeepAlive() {
  useEffect(() => {
    const ping = async () => {
        try {
          const BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') 
            || "https://api.logicmate.io";
          await fetch(`${BASE}/health`);
        } catch {}
      };
    ping();
    const interval = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return null;
}