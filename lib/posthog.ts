import posthog from "posthog-js";

if (typeof window !== "undefined") {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (key && !posthog.__loaded) {
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      capture_pageview: false,
      persistence: "localStorage",
    });
  }
}

export { posthog };
