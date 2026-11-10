# Tests de bout en bout

Package npm **indépendant** : aucune dépendance croisée avec celui de la
racine. Les règles qui le gouvernent sont dans
[`.claude/rules/e2e.md`](../.claude/rules/e2e.md) — ce fichier ne dit que
comment le lancer.

```bash
cd e2e
npm ci
npx playwright install chromium   # une fois
npm test
```

`playwright.config.ts` construit l'application (`npm run build` à la racine)
puis sert `.output/server/index.mjs` sur le port `E2E_PORT` (4320 par défaut).
Jamais `nuxt dev` : le rendu de développement masquerait les écarts avec la
production, qui sont précisément ce que ces tests cherchent.

| Commande | Effet |
|---|---|
| `npm test` | toute la suite, en `chromium` |
| `npm test -- tests/theme.spec.ts` | une seule spec |
| `npm run test:ui` | mode interactif |
| `npm run report` | dernier rapport HTML |
| `npm run typecheck` | types des specs (Playwright ne les vérifie pas) |

## Ce que couvre la suite

| Spec | Objet |
|---|---|
| `navigation.spec.ts` | les quatre rubriques, le monogramme, une fiche de projet, l'unicité du `h1` |
| `menu-clavier.spec.ts` | surcouche au clavier : ouverture, piège à focus, `Échap`, restitution du focus |
| `theme.spec.ts` | bascule de thème et persistance après rechargement |
| `cv.spec.ts` | lien du CV, poids du PDF, téléchargement réel |
| `contact.spec.ts` | `href` des liens `tel:` et `mailto:`, **sans clic** |
| `robots-sitemap.spec.ts` | `/robots.txt`, `/sitemap.xml`, URL canoniques |
| `accessibilite.spec.ts` | audit `@axe-core/playwright`, sept pages × deux thèmes |

## Deux pièges mesurés le 10/11/2026

- **L'audit tourne en `prefers-reduced-motion: reduce`.** Pendant la figure
  d'entrée de `_motion.scss`, axe mesure une couleur interpolée : onze échecs de
  contraste sur treize n'existaient qu'à mi-animation.
- **Le focus passe par `<body>` au bout du cycle** d'un `<dialog>` modal, sous
  Chromium, avant de replier sur le premier élément. Ce n'est pas une fuite :
  la spec vérifie qu'aucun élément interactif *hors* de la surcouche ne reçoit
  le focus.
