# Règles backend (`server/`)

Le site est prérendu par défaut. Une route serveur n'existe que si elle est
indispensable ; aucune n'est créée « au cas où ». Pas de base de données.

Au moment de la rédaction de ces règles, le formulaire de contact n'est pas
encore tranché (fournisseur d'envoi reporté). `server/` est donc vide. Ces
règles s'appliquent dès la première route.

## Conventions

- Routes Nitro dans `server/api/`, nommées par méthode
  (`contact.post.ts`).
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

- Vitest. Toute route a au minimum : cas nominal, cas de validation en échec,
  cas de limitation de débit.
- Les services externes sont simulés (`vi.mock`). Un test ne doit jamais
  provoquer d'envoi réel ni d'appel réseau sortant.
