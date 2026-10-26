---
name: deploy
description: Check-list de déploiement du portfolio sur Render. À utiliser avant et après une mise en production.
---

# Déploiement — portfolio sur Render

Service web unique. Render reconstruit à chaque push sur `main`.

## Avant de pousser sur `main`

Lancer depuis la racine, avec Node 22 (`nvm use`) :

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Les quatre doivent passer. En plus :

- [ ] Le PDF du CV dans `public/` pèse moins de 500 Ko.
- [ ] Aucune clé ni secret dans le diff (`git diff --cached | grep -iE "api_key|secret|token"`).
- [ ] `.env.example` est à jour si une variable d'environnement a été ajoutée.
- [ ] Les variables correspondantes sont renseignées dans le tableau de bord
      Render **avant** le push, sinon le démarrage échoue.

## Configuration Render

- Build : `npm ci && npm run build`
- Start : `node .output/server/index.mjs`
- Variable `NODE_VERSION` = `22`
- Variable `NITRO_PRESET` = `node-server`
- Le port est fourni par Render via `PORT` : ne jamais le coder en dur.

## Après le déploiement

- [ ] La page d'accueil répond en 200.
- [ ] Les cinq rubriques sont accessibles et le logo ramène à l'accueil.
- [ ] Le téléchargement du CV fonctionne.
- [ ] La bascule de thème persiste après rechargement.
- [ ] `/sitemap.xml` et `/robots.txt` répondent.
- [ ] Lighthouse mobile ≥ 95 sur les quatre catégories.

## Limite connue

L'offre gratuite de Render met le service en veille après inactivité : le
premier accès peut prendre une trentaine de secondes. Inacceptable pour un lien
envoyé à un recruteur. Deux remèdes : passer à l'offre payante, ou maintenir le
service éveillé par une tâche planifiée externe. À trancher avant de diffuser
l'adresse.
