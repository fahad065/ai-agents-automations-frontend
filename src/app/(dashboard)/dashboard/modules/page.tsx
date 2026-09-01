import { Suspense } from "react";
import { MyModulesPage } from "@/components/dashboard/modules-page";
export default function ModulesPage() {
  return (
    <Suspense>
      <MyModulesPage />
    </Suspense>
  );
}
