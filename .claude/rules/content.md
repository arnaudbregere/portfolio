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
  modèle abandonné avant P4 au profit de `images`. Son seul usage encore
  défendable serait une image Open Graph par projet, que traite l'issue #17 :
  le champ naîtra avec elle s'il s'avère nécessaire, pas avant.
- Les fichiers de `content/` ne contiennent aucune logique : uniquement des
  constantes typées exportées.
