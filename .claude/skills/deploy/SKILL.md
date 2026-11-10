---
name: deploy
description: Check-list de déploiement du portfolio sur Vercel. À utiliser avant et après une mise en production.
---

# Déploiement — portfolio sur Vercel

**Vercel sert le site. Hostinger n'est que le registrar et le DNS** du domaine
`arnaud-bregere.fr` : il ne sert aucune page. Les deux ne font pas le même
métier, et il n'y a pas à choisir entre eux.

Le projet Vercel est lié au dépôt GitHub. Un push sur `main` redéploie la
production ; une PR obtient une préversion à son adresse propre.

Corrigé le 10/11/2026 : ce document décrivait Render, qui n'a jamais rien
servi.

## Avant de pousser sur `main`

Lancer depuis la racine, avec Node 22 (`nvm use`) :

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Puis depuis `e2e/` :

```bash
npm run typecheck
npm test
```

Les six doivent passer. La CI les rejoue en cinq jobs — `Lint`, `Types`,
`Tests unitaires`, `Build`, `Tests e2e` —, tous requis par la protection de
`main`. En plus :

- [ ] Le PDF du CV dans `public/pdf/` pèse moins de 500 Ko.
- [ ] Aucune clé ni secret dans le diff
      (`git diff --cached | grep -iE "api_key|secret|token"`).
- [ ] `.env.example` est à jour si une variable d'environnement a été ajoutée.

## Configuration Vercel

Rien à régler à la main : Vercel détecte Nuxt et applique le preset `vercel`
de Nitro. Ne pas poser `NITRO_PRESET`, qui ferait l'inverse de ce qu'on veut.

| Réglage | Valeur |
|---|---|
| Framework | Nuxt (détecté) |
| Build | `npm run build` (détecté) |
| Install | `npm ci` (détecté) |
| Node | 22, depuis `.nvmrc` |

Variables d'environnement :

- `NUXT_PUBLIC_SITE_URL` — seulement si l'adresse servie diffère de l'apex
  `https://arnaud-bregere.fr`, qui est le repli du code.
- Rien d'autre. `VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_REF` et
  `VERCEL_ENV` sont posées par Vercel à la construction, et alimentent
  `GET /api/health`.

**Le port ne se code jamais en dur** : sur Vercel il n'y en a pas, chaque
route est une fonction.

## Après le déploiement

Une seule requête dit si le bon commit est en ligne :

```bash
curl -s https://arnaud-bregere.fr/api/health
```

- [ ] `status` vaut `ok`, et `commit` est bien celui qui vient d'être poussé
      (`git rev-parse HEAD`).
- [ ] `environment` vaut `production`.
- [ ] La page d'accueil répond en 200.
- [ ] Les quatre rubriques sont accessibles et le monogramme ramène à
      l'accueil.
- [ ] Le téléchargement du CV fonctionne.
- [ ] La bascule de thème persiste après rechargement.
- [ ] `/sitemap.xml` et `/robots.txt` répondent, et portent la bonne origine.
- [ ] Lighthouse mobile ≥ 95 sur les quatre catégories, **mesuré sur
      l'adresse publique** et jamais sur `localhost` : en local rien n'est
      compressé ni servi par un CDN, et les chiffres ne veulent rien dire.

## Revenir en arrière

Vercel garde chaque déploiement. *Deployments* → le précédent → *Instant
Rollback*. La bascule est immédiate et ne demande aucun commit.

C'est le remède à préférer à un correctif poussé dans l'urgence : remettre
l'ancien build en ligne, puis corriger à froid.

## Le domaine

Enregistré chez Hostinger, dont les serveurs de noms (`ns1.dns-parking.com`,
`ns2.dns-parking.com`) portent les enregistrements. Ils pointent sur Vercel.

**Déplacer le domaine d'un projet Vercel à un autre** se fait dans *Settings*
→ *Domains* du projet cible : Vercel signale qu'il est pris et propose de le
déplacer. Rien à changer chez Hostinger, la bascule est immédiate.

Un seul point à tenir : **l'apex et `www` ne doivent pas se contredire**.
`runtimeConfig.public.siteUrl` désigne l'apex `https://arnaud-bregere.fr` ;
le domaine principal du projet Vercel doit donc être l'apex, `www` ne faisant
que rediriger. Une URL canonique qui désigne une adresse de redirection est
une URL canonique fausse.
