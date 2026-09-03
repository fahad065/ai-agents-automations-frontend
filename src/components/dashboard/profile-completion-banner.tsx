"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserRoundCog, X, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ProfileCompletionBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pathname?.includes("/profile")) { setShow(false); return; }
    if (sessionStorage.getItem("profile-banner-dismissed")) return;

    api.get("/users/profile").then((res) => {
      const u = res.data?.user || res.data;
      const isIncomplete = !u.phoneNumber || !u.country || !u.onboarding?.contentNiche;
      if (isIncomplete) setShow(true);
    }).catch(() => {});
  }, [pathname]);

  const handleDismiss = () => {
    sessionStorage.setItem("profile-banner-dismissed", "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <Alert className="mx-4 mt-4 border-violet-500/25 bg-violet-500/[0.06] pr-3 [&>svg]:text-violet-500">
      <UserRoundCog />
      <AlertTitle>Complete your profile</AlertTitle>
      <AlertDescription className="text-foreground/70">
        Add your phone number, country and content niche so we can send you notifications and invoices.
      </AlertDescription>
      <div className="col-start-2 mt-2 flex items-center gap-2">
        <Button size="sm" onClick={() => router.push("/dashboard/profile")} className="gap-1.5">
          Complete profile <ArrowRight className="size-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDismiss} aria-label="Dismiss">
          <X className="size-3.5" />
        </Button>
      </div>
    </Alert>
  );
}
