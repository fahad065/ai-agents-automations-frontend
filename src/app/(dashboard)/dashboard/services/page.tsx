import { Suspense } from "react";
import { ServicesMarketplacePage } from "@/components/dashboard/services-marketplace-page";
export default function BrowseServicesPage() {
  return (
    <Suspense>
      <ServicesMarketplacePage />
    </Suspense>
  );
}
