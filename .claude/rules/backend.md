# Règles backend (`server/`)

Le site est prérendu par défaut — **réellement depuis le 12/11/2026**
(issue #17) : `nitro.prerender` suit les liens internes depuis `/`, et les
sept pages sortent du build en fichiers statiques. La règle décrivait
jusque-là une intention, pas la configuration.

Une route serveur n'existe que si elle est indispensable ; aucune n'est créée
« au cas où ». Pas de base de données, pas de secret, aucune donnée
d'utilisateur.

`/api/health` est la seule exclusion du prérendu : il rend l'identité du build
et doit répondre à la requête, non la rejouer depuis un fichier.

**`server/` porte trois routes, et seulement trois.** La règle disait
« `server/` est vide, et le reste » ; c'était faux depuis P3 et corrigé le
10/11/2026.

| Route | Ce qu'elle sert | Pourquoi elle ne peut pas être un fichier statique |
|---|---|---|
| `/robots.txt` | `server/routes/robots.txt.ts` | l'origine du site vient de `runtimeConfig` |
| `/sitemap.xml` | `server/routes/sitemap.xml.ts` | idem, et la liste dérive de `content/` |
| `/api/health` | `server/api/health.get.ts` | l'identité du build n'est connue qu'au build |

Le formulaire de contact, lui, n'existera pas : abandonné le 05/11/2026
(issue #5) au profit des liens `tel:` et `mailto:` de `/contact`. Aucun
fournisseur d'envoi, aucune limitation de débit.

Les trois routes en place n'ont ni entrée à valider ni fournisseur externe :
elles tiennent en une couche de transport et un utilitaire testable. Les
couches `services/` et `schemas/` décrites plus bas naîtront avec la première
route qui en aura besoin — pas avant.

**`server/plugins/` n'existe pas, et c'est une décision.** Les en-têtes de
sécurité (12/11/2026, issue #46) sont des constantes de
`server/utils/security-headers.ts`, posées sur toutes les réponses par les
`routeRules` de `nuxt.config.ts` — documents, `/api/health`, routes
prérendues et fichiers de `public/` compris.

La politique de sécurité du contenu tolère le script en ligne
(`'unsafe-inline'`). L'alternative — un jeton tiré par réponse — demande un
greffon accroché à trois hooks de rendu de Nuxt, dont les noms ont changé en
4.6, et ne protégerait que d'un script injecté dans la page. **Le site n'a
aucune entrée par où en injecter un** : contenu TypeScript typé, pas de
formulaire (issue #5), pas de `v-html`, aucun script tiers. Le raisonnement
complet est dans l'utilitaire.

Cette tolérance tombe dès qu'une de ces conditions tombe : entrée
utilisateur, script tiers, mesure d'audience. Le jeton devient alors
obligatoire, et seul `server/utils/security-headers.ts` change.

## Conventions

- Routes Nitro dans `server/api/`, nommées par méthode
  (`health.get.ts`). Une route qui sert un document à une adresse fixe vit
  dans `server/routes/` et porte son extension (`sitemap.xml.ts`).
- **Trois couches, strictement séparées** :
  - `server/api/*` — transport : lit la requête, valide, appelle un service,
    traduit le résultat en réponse HTTP. Aucune logique métier, aucun appel à
    un fournisseur externe.
  - `server/services/*` — infrastructure : seul endroit qui connaît un
    fournisseur externe. Changer de fournisseur d'e-mail ne doit toucher qu'un
    fichier.
  - `server/schemas/*` — schémas de validation, partagés avec le client.
- **Validation obligatoire** de toute entrée, par schéma. Ne jamais faire
  confiance au client, même quand le formulaire valide déjà côté navigateur.
- Secrets par `runtimeConfig` et variables d'environnement, jamais dans le code,
  jamais dans une variable préfixée `NUXT_PUBLIC_`. Un `.env.example` documente
  chaque clé attendue.
- Les réponses d'erreur ne divulguent rien de l'infrastructure : message
  générique au client, détail dans les journaux serveur.
- Toute route exposée publiquement et coûteuse (envoi d'e-mail, appel à une API
  tierce) est limitée en débit et protégée par un piège à robots.
- **Un en-tête de sécurité ne se relâche pas en silence.**
  `tests/unit/security-headers.spec.ts` tient trois listes **closes** — les
  dix directives de la politique, les seize permissions refusées, les sept
  en-têtes posés — et vérifie chaque directive en entier, pas par sa première
  valeur. Ajouter une origine tierce, un joker, un schéma d'URL,
  `'unsafe-eval'`, une directive de plus ou une permission accordée rend donc
  la suite rouge. Le remède est de justifier le changement dans l'utilitaire
  et de déplacer l'interdiction, jamais de retirer le test.

  Cette promesse était fausse jusqu'au 12/11/2026 : le test ne lisait que la
  première valeur de `font-src`, `connect-src` et `manifest-src`, la liste des
  directives n'était pas close — `script-src-elem 'self' cdn.jsdelivr.net`
  passait au vert, alors qu'il **l'emporte** sur `script-src` pour les balises
  `<script>` — et `camera=*` échappait au garde-fou des permissions. Une règle
  qui promet plus que son test ne tient est pire que pas de règle.

## Tests

- Vitest sur l'utilitaire, qui porte la logique ; Playwright sur la route, qui
  porte le contrat HTTP. `tests/unit/health.spec.ts` et
  `e2e/tests/health.spec.ts` en donnent la forme.
- La liste des champs d'une réponse publique est **close** : un test énumère
  les clés rendues, pour qu'une clé ajoutée par mégarde — chemin, version,
  variable d'environnement — échoue avant d'atteindre la production.
- Une route qui validerait une entrée aurait en plus : cas nominal, cas de
  validation en échec, cas de limitation de débit.
- Un en-tête se vérifie aux deux bouts : Vitest sur la valeur
  (`tests/unit/security-headers.spec.ts`), Playwright sur la réponse servie et
  sur la page **sous** la politique
  (`e2e/tests/en-tetes-securite.spec.ts`). Une politique qui casse
  l'hydratation serait verte en unitaire et rouge pour le visiteur : le test
  de bout en bout charge donc la page et bascule le thème.
- Les services externes sont simulés (`vi.mock`). Un test ne doit jamais
  provoquer d'envoi réel ni d'appel réseau sortant.
