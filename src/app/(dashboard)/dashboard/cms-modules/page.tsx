import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const AdminModules = dynamic(
  () => import("@/components/admin/admin-modules").then((m) => m.AdminModules),
  {
    loading: () => (
      <div style={{ padding: "80px", textAlign: "center" }}>
        <Loader2 size={22} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    ),
  }
);

export default function CmsModulesRoute() {
  return <AdminModules />;
}
