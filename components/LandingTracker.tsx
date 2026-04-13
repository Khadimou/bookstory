"use client";

import { useEffect } from "react";
import { posthog } from "@/lib/posthog";

export default function LandingTracker({ variant }: { variant: string }) {
  useEffect(() => {
    posthog.capture("landing_viewed", { hook_variant: variant });
  }, [variant]);

  return null;
}
