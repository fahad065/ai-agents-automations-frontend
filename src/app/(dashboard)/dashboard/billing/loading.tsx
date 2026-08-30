import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div style={{ padding: "80px 24px", textAlign: "center" }}>
      <Loader2 size={22} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
