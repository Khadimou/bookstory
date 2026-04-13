import { Playfair_Display } from "next/font/google";
import DashboardClient from "@/components/DashboardClient";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

interface DashboardPageProps {
  searchParams: { pwd?: string };
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  const pwd = searchParams.pwd ?? "";
  const correct = process.env.DASHBOARD_PASSWORD;

  if (!correct || pwd !== correct) {
    return (
      <main
        className={`${playfair.variable} min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center px-4`}
      >
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-playfair text-3xl font-bold">
              Book<span className="text-accent">Story</span>
            </h1>
            <p className="text-white/40 text-sm">Accès dashboard restreint</p>
          </div>
          <form
            method="GET"
            action="/dashboard"
            className="space-y-3"
          >
            <input
              type="password"
              name="pwd"
              placeholder="Mot de passe"
              autoComplete="current-password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent/60 transition-colors text-sm"
            />
            <button
              type="submit"
              className="w-full bg-accent text-black font-semibold rounded-xl px-6 py-3 text-sm hover:bg-accent/90 active:scale-95 transition-all"
            >
              Accéder
            </button>
          </form>
          {pwd && pwd !== correct && (
            <p className="text-red-400 text-xs text-center">Mot de passe incorrect.</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className={`${playfair.variable}`}>
      <DashboardClient pwd={pwd} />
    </main>
  );
}
