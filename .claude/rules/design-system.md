# Règles design system (`app/components/`)

Organisation **Atomic Design**, mobile first. `DESIGN.md` fait foi pour les
valeurs (tokens, échelles, règles visuelles) ; ce fichier fixe la structure.

## Où vit un composant

| Niveau | Définition | Exemples |
|---|---|---|
| `atoms/` | élément indivisible, sans dépendance à un autre composant du projet | `Button`, `Link`, `Icon`, `Input`, `Heading`, `ThemeToggle` |
| `molecules/` | assemblage d'atomes avec une intention unique | `FormField`, `ProjectCard`, `NavItem`, `StatRow` |
| `organisms/` | section autonome de page, assemble molécules et atomes | `SiteHeader`, `NavOverlay`, `ProjectGrid`, `ContactForm`, `SiteFooter` |
| `templates/` | squelette de mise en page sans contenu réel | `PageTemplate` |
| `pages/` | route Nuxt : fournit les données aux organismes | `index.vue`, `projets/[slug].vue` |

Sens des dépendances : `pages → organisms → molecules → atoms`. **Jamais
l'inverse**, jamais de saut vers le haut.

## Contrat de composant

- Un atome ne connaît ni la route, ni le contenu du site, ni une requête
  réseau. Il reçoit tout par `props` et émet des `emits`. S'il importe quoi que
  ce soit de `content/` ou appelle `useRoute()`, il n'est pas un atome.
- Props typées explicitement (`defineProps<Props>()`), valeurs par défaut via
  `withDefaults`. Pas de prop booléenne négative (`disabled`, pas
  `notDisabled`).
- Un composant = un fichier = une responsabilité. Pas de composant interne non
  exporté dans le même fichier.
- Le style est `scoped` et n'utilise que des tokens. Aucune marge extérieure
  posée par le composant lui-même : l'espacement entre composants appartient au
  parent.
- Nommage des classes en BEM préfixé par niveau : `.a-button`, `.m-field`,
  `.o-header`, `.o-shell` pour les objets de mise en page.

## Avant de créer un composant

1. Vérifier qu'aucun existant ne couvre le besoin, éventuellement via une prop
   supplémentaire — l'ancien portfolio est mort d'une duplication de styles.
2. Si le composant introduit une décision visuelle (couleur, échelle, rythme),
   la trancher dans `DESIGN.md` avant d'écrire le code.
3. Écrire le test en même temps que le composant, pas après.
