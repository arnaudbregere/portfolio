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
