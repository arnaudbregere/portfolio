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
- Chaque projet porte au minimum : `slug`, `title`, `year`, `role`, `stack`,
  `problem`, `solution`, `result`, `links`, `cover`. Un projet sans `result`
  mesurable est incomplet.
- Les fichiers de `content/` ne contiennent aucune logique : uniquement des
  constantes typées exportées.
