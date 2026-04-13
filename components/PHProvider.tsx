"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { posthog } from "@/lib/posthog";

export default function PHProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return <>{children}</>;
}
