import { Playfair_Display } from "next/font/google";
import BookFeed from "@/components/BookFeed";
import EmailForm from "@/components/EmailForm";
import LandingTracker from "@/components/LandingTracker";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

// Correspondance variants → vidéos TikTok
// ?hook=D → Vidéo TikTok : Crime et Châtiment (Dostoïevski)
// ?hook=B → Vidéo TikTok : Le Lys dans la vallée (Balzac)
// ?hook=C → Vidéo TikTok : Les Misérables (Victor Hugo)
// ?hook=A → variant original (contrôle)

const HOOKS: Record<string, { label: string; text: string }> = {
  A: {
    label: "Ce livre a changé ma vie",
    text: "📖 TikTok dit que ce livre va changer ta vie. On a décidé d'en faire une expérience.",
  },
  B: {
    label: "Le livre dont tout le monde parle",
    text: "🔥 3 millions de vues sur TikTok. Un seul livre. Découvre pourquoi.",
  },
  C: {
    label: "BookTok a raison ?",
    text: "✨ BookTok a mis ce roman en tendance. On t'en donne les meilleurs extraits.",
  },
  D: {
    label: "Tu viens de TikTok ?",
    text: "Tu viens de TikTok ? La suite de l'extrait est juste en dessous 👇",
  },
};

const DEFAULT_HOOK = HOOKS["D"];

interface PageProps {
  searchParams: { hook?: string };
}

export default function Page({ searchParams }: PageProps) {
  const hookKey = (searchParams.hook ?? "D").toUpperCase();
  const hook = HOOKS[hookKey] ?? DEFAULT_HOOK;
  const variant = hookKey in HOOKS ? hookKey : "D";

  return (
    <main
      className={`${playfair.variable} min-h-screen bg-[#0d0d0d] text-white`}
    >
      <LandingTracker variant={variant} />

      {/* TikTok Hook Banner */}
      <div className="w-full bg-accent/10 border-b border-accent/20 px-4 py-3">
        <p className="text-center text-accent text-sm font-mono tracking-wide">
          {hook.text}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col gap-16">
        {/* Hero */}
        <section className="text-center space-y-4">
          <span className="text-accent/60 text-xs font-mono tracking-[0.3em] uppercase">
            Bientôt disponible
          </span>
          <h1 className="font-playfair text-5xl sm:text-6xl font-bold leading-tight">
            Book<span className="text-accent">Story</span>
          </h1>
          <p className="font-playfair text-white/60 text-xl italic max-w-md mx-auto leading-relaxed">
            Les grands classiques de la littérature, racontés comme des stories.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="h-px w-12 bg-accent/30" />
            <div className="h-px w-12 bg-accent/30" />
          </div>
        </section>

        {/* Book Feed */}
        <section className="space-y-6">
          <h2 className="font-playfair text-2xl text-center text-white/80">
            Extraits du moment
          </h2>
          <BookFeed />
        </section>

        {/* Email CTA */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-playfair text-3xl font-semibold">
              Sois parmi les premiers
            </h2>
            <p className="text-white/40 text-sm">
              Un extrait marquant chaque semaine. Gratuit.
            </p>
          </div>
          <EmailForm variant={variant} />
        </section>

        {/* Footer */}
        <footer className="text-center text-white/20 text-xs font-mono pt-4 border-t border-white/5">
          © {new Date().getFullYear()} BookStory · Tous les extraits sont issus du domaine public
        </footer>
      </div>
    </main>
  );
}
