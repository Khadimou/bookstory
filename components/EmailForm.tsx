"use client";

import { useState } from "react";
import { posthog } from "@/lib/posthog";

interface EmailFormProps {
  variant: string;
}

export default function EmailForm({ variant }: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    posthog.capture("email_captured", {
      variant,
      source: "landing_page",
      email,
    });

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, variant, source: "landing_page" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur serveur");
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erreur inattendue");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-2">
        <p className="font-playfair text-accent text-2xl">C&apos;est noté !</p>
        <p className="text-white/50 text-sm">
          On vous prévient dès le lancement. Restez curieux.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent/60 transition-colors text-sm"
        />
        <button
          type="submit"
          className="bg-accent text-black font-semibold rounded-xl px-6 py-3 text-sm hover:bg-accent/90 active:scale-95 transition-all whitespace-nowrap"
        >
          Être notifié au lancement
        </button>
      </div>
      {status === "error" && (
        <p className="text-red-400 text-xs text-center">
          {errorMessage || "Une erreur est survenue. Réessayez."}
        </p>
      )}
      <p className="text-white/25 text-xs text-center">
        Pas de spam. Juste les grandes histoires.
      </p>
    </form>
  );
}
