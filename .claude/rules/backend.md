# Règles backend (`server/`)

Le site est prérendu par défaut. Une route serveur n'existe que si elle est
indispensable ; aucune n'est créée « au cas où ». Pas de base de données, pas
de secret, aucune donnée d'utilisateur.

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

## Tests

- Vitest sur l'utilitaire, qui porte la logique ; Playwright sur la route, qui
  porte le contrat HTTP. `tests/unit/health.spec.ts` et
  `e2e/tests/health.spec.ts` en donnent la forme.
- La liste des champs d'une réponse publique est **close** : un test énumère
  les clés rendues, pour qu'une clé ajoutée par mégarde — chemin, version,
  variable d'environnement — échoue avant d'atteindre la production.
- Une route qui validerait une entrée aurait en plus : cas nominal, cas de
  validation en échec, cas de limitation de débit.
- Les services externes sont simulés (`vi.mock`). Un test ne doit jamais
  provoquer d'envoi réel ni d'appel réseau sortant.
