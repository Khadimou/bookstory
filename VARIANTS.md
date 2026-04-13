# Variants TikTok → Landing

| Paramètre | Vidéo TikTok | Bannière |
|-----------|-------------|---------|
| `?hook=D` | Crime et Châtiment (Dostoïevski) | "Tu viens de TikTok ? La suite de l'extrait est juste en dessous 👇" |
| `?hook=B` | Le Lys dans la vallée (Balzac) | "🔥 3 millions de vues sur TikTok. Un seul livre. Découvre pourquoi." |
| `?hook=C` | Les Misérables (Victor Hugo) | "✨ BookTok a mis ce roman en tendance. On t'en donne les meilleurs extraits." |
| `?hook=A` | Variant contrôle (original) | "📖 TikTok dit que ce livre va changer ta vie." |

## Liens bio TikTok

```
https://bookstory.vercel.app/?hook=D   ← Crime et Châtiment
https://bookstory.vercel.app/?hook=B   ← Le Lys dans la vallée
https://bookstory.vercel.app/?hook=C   ← Les Misérables
https://bookstory.vercel.app/?hook=A   ← Contrôle
```

## Events PostHog

- `landing_viewed` → `{ hook_variant: "A" | "B" | "C" | "D" }`
- `email_submitted` → `{ hook_variant: "A" | "B" | "C" | "D", source: "landing_page" }`

Pour comparer les taux de conversion : **PostHog → Insights → Funnel** avec `landing_viewed` → `email_submitted`, segmenté par `hook_variant`.
