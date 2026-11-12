# Règles contenu (`content/`)

Le contenu éditorial du site vit dans `content/`, en **TypeScript typé**.

- Un type par famille de contenu (`Project`, `Experience`, `Education`,
  `SkillGroup`), exporté depuis `content/types.ts`.
- **Aucune chaîne HTML, aucun `v-html`.** Un paragraphe est une chaîne de texte,
  une liste est un tableau. La mise en forme appartient aux composants.
  L'ancien portfolio stockait son CV en HTML dans un fichier TypeScript, rendu
  par `v-html` : contenu invisible pour les moteurs de recherche, intestable et
  exposé à l'injection. Ne pas reproduire.
- Pas de style dans les données : ni classe CSS, ni couleur, ni balise.
- Les textes sont en français. Un texte destiné à une alternative d'image, un
  `aria-label` ou une méta `description` est une propriété nommée du contenu,
  pas une valeur improvisée dans le template.
- Chaque projet porte les champs que le type `Project` impose : `slug`,
  `title`, `year`, `role`, `problem`, `solution`, `result`, `stack`, `links` et
  `featured`. Un projet sans `result` mesurable est incomplet.
- Les visuels sont facultatifs, dans `images`. Une capture porte son `alt` et
  sa `caption` avec elle, jamais improvisés dans un gabarit. Un projet dont
  l'interface appartient à un employeur n'en a aucune, et une démo jouable dans
  la page vaut mieux qu'une capture.
- **`cover` a été retiré de cette liste le 04/11/2026** (issue #16). Le champ
  n'a jamais existé, ni dans le type ni dans une fiche : la règle décrivait un
  modèle abandonné avant P4 au profit de `images`. Il n'est pas né : l'issue
  #17 a livré `ogImage` à sa place le 04/11/2026.
- **`ogImage` porte l'image de partage d'une fiche**, 1200 × 630, servie depuis
  `public/og/`. Ce n'est pas une capture de `images` : les captures sont en
  WebP, que LinkedIn ne restitue pas, et leur rapport n'est pas celui d'une
  grande carte. `scripts/og-card.js` compose l'image, capture comprise. Le
  champ est facultatif : sans lui, la fiche retombe sur l'image du site.
- Les fichiers de `content/` ne contiennent aucune logique : uniquement des
  constantes typées exportées.

## Le contenu change, le référencement change avec lui

**Un contenu modifié n'est pas livré tant que ce qui le décrit n'a pas été
relu, dans le même commit.** Une page corrige un chiffre et sa `description`
garde l'ancien : la page est juste, le résultat de recherche est faux, et
personne ne le voit — ni en relisant la page, ni dans un test.

C'est arrivé le 12/11/2026 (issue #53). L'accueil est passé à « 10 ans
d'expérience front-end » pendant que sa méta annonçait « six ans chez Figaro
Classifieds » — déjà faux par ailleurs, l'entrée chez Figaro datant d'octobre
2019. Le numéro de téléphone est paru sur l'accueil sans que le JSON-LD
`Person` le porte. Deux écarts introduits par un commit qui ne touchait pas
aux métadonnées.

À relire à chaque modification de `content/` ou du texte d'une page :

| Ce qui change | Ce qui doit être relu |
|---|---|
| un chiffre, une durée, un intitulé | `description` et `title` des pages qui le reprennent |
| une coordonnée (téléphone, e-mail, profil) | le JSON-LD `Person` d'`app/app.vue` |
| un projet ajouté, retiré ou renommé | `/sitemap.xml`, l'`ogImage` de la fiche, les liens de l'accueil |
| un titre de page | la `description`, qui ne doit pas le répéter mot pour mot |
| une image de partage | `ogImageAlt`, et les 1200 × 630 de `scripts/og-card.js` |

Deux garde-fous tiennent ce qui peut l'être, et ils ne remplacent pas la
relecture : `e2e/tests/robots-sitemap.spec.ts` vérifie que chaque page porte
une `description` non vide, unique et de longueur tenable, et que le JSON-LD
`Person` annonce les mêmes coordonnées que la page. Aucun test ne peut dire
qu'une phrase est devenue fausse.
