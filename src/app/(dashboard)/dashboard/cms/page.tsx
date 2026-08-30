import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const CmsPage = dynamic(
  () => import("@/components/dashboard/cms-page").then((m) => m.CmsPage),
  {
    loading: () => (
      <div style={{ padding: "80px", textAlign: "center" }}>
        <Loader2 size={22} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    ),
  }
);

export default function CmsRoute() {
  return <CmsPage />;
}
