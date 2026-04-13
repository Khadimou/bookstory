"use client";

import { useState, useRef } from "react";

const BOOKS = [
  {
    id: 0,
    title: "Crime et Châtiment",
    author: "Dostoïevski",
    year: "1866",
    excerpt:
      "Il avait tué. Il avait cru que ça le laisserait indifférent — parce qu'il avait prouvé, par la logique, que certains hommes avaient le droit de le faire. La logique avait tenu. Lui, non.",
    tag: "CLASSIQUE",
  },
  {
    id: 1,
    title: "Orgueil et Préjugés",
    author: "Jane Austen",
    year: "1813",
    excerpt:
      "C'est une vérité universellement reconnue qu'un homme célibataire pourvu d'une belle fortune doit avoir envie de se marier. Aussi, lorsqu'un tel homme vient s'établir dans le voisinage, cette vérité est-elle si bien gravée dans l'esprit de ses voisins qu'ils le considèrent sur-le-champ comme la propriété légitime de l'une ou l'autre de leurs filles.",
    tag: "Romance · Classique",
  },
  {
    id: 2,
    title: "Le Rouge et le Noir",
    author: "Stendhal",
    year: "1830",
    excerpt:
      "La petite ville de Verrières peut passer pour l'une des plus jolies de la Franche-Comté. Ses maisons blanches avec leurs toits pointus de tuiles rouges s'étendent sur la pente d'une colline, dont des touffes de vigoureux châtaigniers marquent les moindres sinuosités.",
    tag: "Drame · Psychologie",
  },
  {
    id: 3,
    title: "Les Misérables",
    author: "Victor Hugo",
    year: "1862",
    excerpt:
      "En 1815, M. Charles-François-Bienvenu Myriel était évêque de Digne. C'était un vieillard d'environ soixante-quinze ans ; il occupait le siège de Digne depuis 1806. Quoique ce détail ne touche en aucune manière au fond de notre récit, il peut être utile, dans un intérêt d'exactitude en toutes choses, d'indiquer ici les bruits et les propos qui avaient couru sur son compte à son arrivée dans le diocèse.",
    tag: "Épopée · Social",
  },
];

export default function BookFeed() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 50 && current < BOOKS.length - 1) setCurrent((c) => c + 1);
    if (delta < -50 && current > 0) setCurrent((c) => c - 1);
    touchStartX.current = null;
  }

  const book = BOOKS[current];

  return (
    <div className="w-full max-w-md mx-auto select-none">
      {/* Card */}
      <div
        className="relative bg-[#111111] border border-white/10 rounded-2xl p-8 min-h-[300px] flex flex-col justify-between overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Accent line */}
        <div className="absolute top-0 left-8 right-8 h-px bg-accent/40" />

        <div className="space-y-4">
          <span className="text-accent/80 text-xs font-mono tracking-widest uppercase">
            {book.tag}
          </span>
          <p className="font-playfair text-white/90 text-lg leading-relaxed italic">
            &ldquo;{book.excerpt}&rdquo;
          </p>
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="font-playfair text-accent font-semibold">{book.title}</p>
            <p className="text-white/50 text-sm">{book.author} · {book.year}</p>
          </div>
          {/* Desktop arrows */}
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-accent hover:text-accent disabled:opacity-20 transition-colors"
              aria-label="Précédent"
            >
              ←
            </button>
            <button
              onClick={() => setCurrent((c) => Math.min(BOOKS.length - 1, c + 1))}
              disabled={current === BOOKS.length - 1}
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-accent hover:text-accent disabled:opacity-20 transition-colors"
              aria-label="Suivant"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {BOOKS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-accent" : "w-1.5 bg-white/20"
            }`}
            aria-label={`Extrait ${i + 1}`}
          />
        ))}
      </div>
      <p className="text-center text-white/30 text-xs mt-3 sm:hidden">
        Swipez pour découvrir d&apos;autres extraits →
      </p>
    </div>
  );
}
