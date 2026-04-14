import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const POSTHOG_HOST = "https://eu.i.posthog.com";

async function runHogQLQuery(query: string): Promise<{ results: unknown[][] }> {
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;

  if (!projectId || !apiKey || projectId === "your_project_id" || apiKey === "your_personal_api_key") {
    return { results: [] };
  }

  try {
    const res = await fetch(
      `${POSTHOG_HOST}/api/projects/${projectId}/query/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
        cache: "no-store",
      }
    );

    if (!res.ok) return { results: [] };
    const data = await res.json();
    return { results: data.results ?? [] };
  } catch {
    return { results: [] };
  }
}

async function getActiveVisitors(): Promise<number> {
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;

  if (!projectId || !apiKey || projectId === "your_project_id" || apiKey === "your_personal_api_key") {
    return 0;
  }

  try {
    const query = `
      SELECT count(DISTINCT distinct_id) as active
      FROM events
      WHERE timestamp >= now() - interval 5 minute
    `;
    const data = await runHogQLQuery(query);
    const row = data.results[0];
    return typeof row?.[0] === "number" ? row[0] : 0;
  } catch {
    return 0;
  }
}

export async function GET(req: NextRequest) {
  const auth = req.cookies.get("dashboard_auth")?.value;
  if (!auth || auth !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // PostHog queries
  const [landingRes, emailRes, liveRes, activeVisitorsCount] = await Promise.all([
    runHogQLQuery(`
      SELECT properties.hook_variant, count() as total
      FROM events
      WHERE event = 'landing_viewed'
        AND timestamp >= now() - interval 7 day
      GROUP BY properties.hook_variant
    `),
    runHogQLQuery(`
      SELECT properties.hook_variant, count() as total
      FROM events
      WHERE event = 'email_submitted'
        AND timestamp >= now() - interval 7 day
      GROUP BY properties.hook_variant
    `),
    runHogQLQuery(`
      SELECT event, properties, timestamp, distinct_id
      FROM events
      WHERE timestamp >= now() - interval 1 day
      ORDER BY timestamp DESC
      LIMIT 10
    `),
    getActiveVisitors(),
  ]);

  // Hook Score queries (may not exist yet)
  const [hookReadRes, hookContinueRes] = await Promise.all([
    runHogQLQuery(`
      SELECT properties.hook_variant, count() as total
      FROM events
      WHERE event = 'hook_read_complete'
        AND timestamp >= now() - interval 7 day
      GROUP BY properties.hook_variant
    `),
    runHogQLQuery(`
      SELECT properties.hook_variant, count() as total
      FROM events
      WHERE event = 'hook_continue_clicked'
        AND timestamp >= now() - interval 7 day
      GROUP BY properties.hook_variant
    `),
  ]);

  // Build variant maps from PostHog
  const landingByVariant: Record<string, number> = {};
  for (const row of landingRes.results) {
    if (row[0] != null) landingByVariant[String(row[0])] = Number(row[1]) || 0;
  }

  const emailByVariant: Record<string, number> = {};
  for (const row of emailRes.results) {
    if (row[0] != null) emailByVariant[String(row[0])] = Number(row[1]) || 0;
  }

  const hookReadByVariant: Record<string, number> = {};
  for (const row of hookReadRes.results) {
    if (row[0] != null) hookReadByVariant[String(row[0])] = Number(row[1]) || 0;
  }

  const hookContinueByVariant: Record<string, number> = {};
  for (const row of hookContinueRes.results) {
    if (row[0] != null) hookContinueByVariant[String(row[0])] = Number(row[1]) || 0;
  }

  // Live feed
  const liveFeed = liveRes.results.map((row) => ({
    event: row[0],
    properties: row[1],
    timestamp: row[2],
    distinct_id: row[3],
  }));

  // Prisma: email data
  const [totalSubscribers, allSubscribers] = await Promise.all([
    prisma.subscriber.count(),
    prisma.subscriber.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: { createdAt: true, variant: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Group subscribers by date (last 7 days)
  const byDate: Record<string, number> = {};
  for (const sub of allSubscribers) {
    const dateKey = sub.createdAt.toISOString().slice(0, 10);
    byDate[dateKey] = (byDate[dateKey] ?? 0) + 1;
  }

  // Group subscribers by variant (last 7 days)
  const subsByVariant: Record<string, number> = {};
  for (const sub of allSubscribers) {
    const v = sub.variant ?? "unknown";
    subsByVariant[v] = (subsByVariant[v] ?? 0) + 1;
  }

  return NextResponse.json({
    variants: ["A", "B", "C", "D"].map((v) => ({
      variant: v,
      landing_viewed: landingByVariant[v] ?? 0,
      email_submitted: emailByVariant[v] ?? 0,
      hook_read_complete: hookReadByVariant[v] ?? 0,
      hook_continue_clicked: hookContinueByVariant[v] ?? 0,
    })),
    emails: {
      total: totalSubscribers,
      byDate,
      byVariant: subsByVariant,
    },
    live: {
      activeVisitors: activeVisitorsCount,
      feed: liveFeed,
    },
  });
}
