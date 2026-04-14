"use client";

import { useEffect, useState, useCallback } from "react";

interface VariantData {
  variant: string;
  landing_viewed: number;
  email_submitted: number;
  hook_read_complete: number;
  hook_continue_clicked: number;
}

interface EmailData {
  total: number;
  byDate: Record<string, number>;
  byVariant: Record<string, number>;
}

interface LiveEvent {
  event: string;
  properties: Record<string, unknown> | null;
  timestamp: string;
  distinct_id: string;
}

interface LiveData {
  activeVisitors: number;
  feed: LiveEvent[];
}

interface DashboardData {
  variants: VariantData[];
  emails: EmailData;
  live: LiveData;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `il y a ${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `il y a ${hrs}h`;
}

function eventIcon(name: string): string {
  if (name === "landing_viewed") return "👁";
  if (name === "email_submitted") return "✉️";
  if (name === "$pageview") return "📄";
  if (name === "hook_read_complete") return "📖";
  if (name === "hook_continue_clicked") return "➡️";
  return "⚡";
}

function ConversionRate({ submitted, viewed }: { submitted: number; viewed: number }) {
  if (viewed === 0) return <span className="text-white/30">—</span>;
  const rate = ((submitted / viewed) * 100).toFixed(1);
  return <span className="text-accent font-bold">{rate}%</span>;
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        setError("Erreur lors du chargement des données.");
        return;
      }
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError("Impossible de contacter le serveur.");
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <p className="text-white/30 animate-pulse">Chargement…</p>
      </div>
    );
  }

  // Find best variant by conversion rate
  let bestVariant = "";
  let bestRate = -1;
  for (const v of data.variants) {
    if (v.landing_viewed > 0) {
      const rate = v.email_submitted / v.landing_viewed;
      if (rate > bestRate) {
        bestRate = rate;
        bestVariant = v.variant;
      }
    }
  }

  // Hook score: only if there's any hook_read_complete data
  const hasHookData = data.variants.some((v) => v.hook_read_complete > 0);

  // 7-day date range
  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    last7Days.push(d.toISOString().slice(0, 10));
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-playfair text-3xl font-bold">
            Book<span className="text-accent">Story</span> Dashboard
          </h1>
          {lastUpdated && (
            <p className="text-white/30 text-xs font-mono">
              Mis à jour : {lastUpdated.toLocaleTimeString("fr-FR")}
            </p>
          )}
        </div>

        {/* Bloc 1 — Variants */}
        <section>
          <h2 className="text-white/50 text-xs font-mono tracking-widest uppercase mb-4">
            Variants A/B/C/D — 7 derniers jours
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {data.variants.map((v) => {
              const isBest = v.variant === bestVariant && v.landing_viewed > 0;
              return (
                <div
                  key={v.variant}
                  className={`bg-[#111111] rounded-2xl p-6 border ${
                    isBest ? "border-accent" : "border-white/10"
                  } relative`}
                >
                  {isBest && (
                    <span className="absolute top-3 right-3 text-accent text-[10px] font-mono tracking-widest uppercase">
                      Meilleur
                    </span>
                  )}
                  <p className="text-accent text-2xl font-bold font-mono mb-4">
                    {v.variant}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Vues</span>
                      <span className="text-white font-mono">{v.landing_viewed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Inscrits</span>
                      <span className="text-white font-mono">{v.email_submitted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Conversion</span>
                      <ConversionRate submitted={v.email_submitted} viewed={v.landing_viewed} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bloc 2 — Hook Score */}
        <section>
          <h2 className="text-white/50 text-xs font-mono tracking-widest uppercase mb-4">
            Hook Score
          </h2>
          {!hasHookData ? (
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
              <p className="text-white/30 text-sm italic">
                Ajoute les events de scroll pour voir le Hook Score
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {data.variants.map((v) => (
                  <div key={v.variant} className="space-y-1">
                    <p className="text-accent font-mono font-bold">{v.variant}</p>
                    <p className="text-white/30 text-sm">Score : —</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
              <p className="text-white/30 text-xs mb-4 font-mono">
                Formule : read_complete% + (continue_clicked% × 2)
              </p>
              <div className="grid grid-cols-2 gap-4">
                {data.variants.map((v) => {
                  const views = v.landing_viewed;
                  const readPct = views > 0 ? (v.hook_read_complete / views) * 100 : 0;
                  const continuePct = views > 0 ? (v.hook_continue_clicked / views) * 100 : 0;
                  const score = readPct + continuePct * 2;
                  return (
                    <div key={v.variant} className="space-y-1">
                      <p className="text-accent font-mono font-bold">{v.variant}</p>
                      <p className="text-white text-xl font-bold">{score.toFixed(1)}</p>
                      <p className="text-white/30 text-xs">
                        read {readPct.toFixed(0)}% · continue {continuePct.toFixed(0)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Bloc 3 — Emails */}
        <section>
          <h2 className="text-white/50 text-xs font-mono tracking-widest uppercase mb-4">
            Inscrits email
          </h2>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-6">
            <p className="text-accent text-5xl font-bold font-mono">
              {data.emails.total}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* 7-day table */}
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
                  7 derniers jours
                </p>
                <table className="w-full text-sm">
                  <tbody>
                    {last7Days.map((date) => {
                      const count = data.emails.byDate[date] ?? 0;
                      return (
                        <tr key={date} className="border-b border-white/5">
                          <td className="py-1.5 text-white/40 font-mono text-xs">{date}</td>
                          <td className="py-1.5 text-right font-mono text-white">
                            {count > 0 ? (
                              <span className="text-accent">{count}</span>
                            ) : (
                              <span className="text-white/20">0</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* by variant */}
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
                  Par variant (7j)
                </p>
                <div className="space-y-2">
                  {["A", "B", "C", "D"].map((v) => {
                    const count = data.emails.byVariant[v] ?? 0;
                    return (
                      <div key={v} className="flex justify-between text-sm">
                        <span className="text-white/50 font-mono">Variant {v}</span>
                        <span className={count > 0 ? "text-accent font-bold font-mono" : "text-white/20 font-mono"}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bloc 4 — Live */}
        <section>
          <h2 className="text-white/50 text-xs font-mono tracking-widest uppercase mb-4">
            Live
          </h2>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-6">
            {/* Active visitors */}
            <div className="flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/60 text-sm">Visiteurs actifs (5 min)</span>
              <span className="text-accent font-bold font-mono text-xl ml-auto">
                {data.live.activeVisitors}
              </span>
            </div>
            {/* Feed */}
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-3">
                10 derniers events
              </p>
              {data.live.feed.length === 0 ? (
                <p className="text-white/20 text-sm italic">Aucun event récent.</p>
              ) : (
                <ul className="space-y-2">
                  {data.live.feed.map((ev, i) => {
                    const props = ev.properties as Record<string, unknown> | null;
                    const variant = props?.hook_variant
                      ? String(props.hook_variant)
                      : null;
                    return (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm border-b border-white/5 pb-2"
                      >
                        <span className="text-lg w-6 text-center">{eventIcon(String(ev.event))}</span>
                        <span className="text-white/80 flex-1 truncate font-mono text-xs">
                          {String(ev.event)}
                          {variant && (
                            <span className="ml-2 text-accent">· {variant}</span>
                          )}
                        </span>
                        <span className="text-white/30 text-xs whitespace-nowrap font-mono">
                          {ev.timestamp ? relativeTime(String(ev.timestamp)) : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
