# Règles design system (`app/components/`)

Organisation **Atomic Design**, mobile first, seul système d'organisation du
dépôt. `DESIGN.md` fait foi pour les valeurs (tokens, échelles, règles
visuelles) ; ce fichier fixe la structure.

**Aucun composant spéculatif.** Les niveaux ci-dessous décrivent où un composant
*va*, pas ce qu'il faut écrire. Les exemples sont les composants **réellement
écrits** : un exemple inventé finit par être construit pour cocher une case.
`ContactForm` y figurait jusqu'au 09/11/2026 alors que le formulaire est
abandonné depuis l'issue #5, et `ProjectGrid` n'a jamais existé — la page
`/projets` est une liste, pas une grille. Un composant naît de la page qui en a besoin,
jamais pour cocher une case de phase : les six atomes écrits le 26/10/2026 ont
été supprimés pour cette raison. Un dossier de niveau n'est créé qu'au moment où
un fichier y entre.

## Où vit un composant

| Niveau | Définition | Exemples |
|---|---|---|
| `atoms/` | élément indivisible, sans dépendance à un autre composant du projet | `Button`, `CvLink`, `Icon` |
| `molecules/` | assemblage d'atomes avec une intention unique | `SiteLink`, `ThemeToggle` |
| `organisms/` | section autonome de page, assemble molécules et atomes | `SiteHeader`, `NavOverlay`, `ProjectDetail`, `SiteFooter` |
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

1. Nommer la page qui l'utilise **dans le même commit**. Sans cette page, le
   composant ne doit pas être écrit.
2. Vérifier qu'aucun existant ne couvre le besoin, éventuellement via une prop
   supplémentaire — l'ancien portfolio est mort d'une duplication de styles.
3. Si le composant introduit une décision visuelle (couleur, échelle, rythme),
   la trancher dans `DESIGN.md` avant d'écrire le code.
4. Écrire le test en même temps que le composant, pas après.
