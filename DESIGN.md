# DESIGN.md

Décisions de design du portfolio. Ce fichier fait foi : un composant ne fixe
jamais une valeur de couleur, d'espacement, de durée ou de taille de texte, il
consomme un token de `app/styles/_tokens.scss`. Un écart volontaire se
documente ici **avant** le commit qui l'introduit.

La planche `/_ds` vérifie ces décisions à l'exécution. Elle n'existe qu'en
développement : `nuxt.config.ts` retire la route du build de production.

---

## 1. Direction

Épinglée par l'utilisateur et par l'issue
[#1](https://github.com/arnaudbregere/portfolio/issues/1) : **mazarine.com** et
**arter.studio**.

Le site est une planche de spécimen éditoriale qui met le travail sous examen.
Chaque affirmation porte son chiffre mesuré à côté d'elle.

Il refuse l'arrangement que cette catégorie livre toujours : héros sombre de
terminal avec accent néon, grille uniforme de cartes de projet égales, barres de
compétences tenant lieu de preuve.

Relevé sur les deux références :

- **mazarine.com** — une seule famille, une seule graisse, noir sur blanc,
  libellés en capitales de 13 px, filets plutôt que cartes. Procédé récurrent :
  la phrase manifeste dont les mots structurels passent en gris pendant que les
  noms porteurs restent à l'encre pleine. Aucune couleur hors images.
- **arter.studio** — portfolio mono-personne, une seule encre saturée portant
  toute la surface, capitales condensées lourdes, contrôles à filet.

**Report de charge assumé.** Le monde Mazarine s'appuie sur une photographie de
luxe que ce sujet ne peut pas fournir : les captures de Figaro Classifieds et de
La Poste sont propriétaires. La charge passe sur une **encre d'annotation
réservée** et sur des **figures numérotées**, empruntées à la planche de brevet.

Contrat de direction complet, avec les cinq hausses nommées et le tirage
`concept-seed` qu'elles viennent de :
`.impeccable/surfaces/app-pages-ds-vue.md`.

## 2. Palette

Deux thèmes, bascule persistée par `@nuxtjs/color-mode` sous la clé
`portfolio-theme`. Le thème clair est le défaut.

L'encre carmin est la seule couleur de la palette. Elle ne se dépense que sur ce
qui est sous examen et sur l'action principale unique.

| Token | Rôle | Clair | Sombre |
|---|---|---|---|
| `--color-bg` | Fond, papier chaud | `#f7f4ef` | `#121110` |
| `--color-bg-subtle` | Fond de figure | `#ede8e0` | `#1c1a18` |
| `--color-fg` | Texte courant | `#14120f` | `#f2efe9` |
| `--color-fg-muted` | Texte secondaire | `#6b655c` | `#9c958a` |
| `--color-line` | Filet décoratif | `#d6cfc4` | `#2e2b27` |
| `--color-line-strong` | Bordure de contrôle | `#8c857a` | `#7a7369` |
| `--color-ink` | Encre d'annotation | `#b3122b` | `#ff5c72` |
| `--color-ink-fg` | Texte sur encre | `#ffffff` | `#121110` |
| `--color-focus` | Indicateur de focus | `#1a5fff` | `#7aa2ff` |

Le papier est chaud plutôt que blanc pur : cela désamorce le risque d'austérité
d'un monde privé de photographie. L'encre garde la même teinte d'un thème à
l'autre (350° contre 353°), seulement éclaircie pour tenir son seuil sur fond
sombre.

### Contraste

Ratios calculés par la formule WCAG 2.1, verrouillés par
`tests/unit/contrast.spec.ts` et remesurés à l'exécution par `/_ds`.

| Couple | Critère | Seuil | Clair | Sombre |
|---|---|---|---|---|
| `fg` / `bg` | 1.4.3 | 4,5:1 | 17,04:1 | 16,44:1 |
| `fg-muted` / `bg` | 1.4.3 | 4,5:1 | 5,26:1 | 6,36:1 |
| `ink` / `bg` | 1.4.3 | 4,5:1 | 6,30:1 | 6,31:1 |
| `ink-fg` / `ink` | 1.4.3 | 4,5:1 | 6,91:1 | 6,31:1 |
| `line-strong` / `bg` | 1.4.11 | 3:1 | 3,33:1 | 4,03:1 |
| `focus` / `bg` | 1.4.11 | 3:1 | 4,64:1 | 7,58:1 |

`--color-line-strong` existe parce que `--color-line` ne peut pas identifier un
contrôle. WCAG 1.4.11 exige 3:1 pour la frontière visuelle d'un composant ; le
filet décoratif mesure 1,41:1.

**Écart assumé.** `--color-line` mesure **1,41:1** en clair et **1,34:1** en
sombre. WCAG ne s'y applique pas : un filet décoratif n'identifie aucun contrôle
et ne porte aucune information. Mais une hiérarchie de page qui repose sur ces
filets s'efface sur dalle bas de gamme et en plein jour. L'écart est assumé, pas
hérité. Conséquence opposable : **aucune information ne doit reposer sur la
seule présence d'un filet.** Un filet sépare, il ne dit rien.

Aucun test ne verrouille ce couple. Une assertion le maintenant sous 3:1 ferait
échouer la suite le jour où le filet serait relevé.

**Marge courte.** `--color-line-strong` ne passe que de 0,33 point en clair
(3,33:1 contre 3:1). C'est le couple le plus serré de la palette et la raison
d'être des tests de seuil : un assombrissement du papier ou un éclaircissement
du filet le fait tomber.

## 3. Typographie

Une seule famille chargée : **Archivo Variable**, auto-hébergée dans
`public/fonts/`, sans dépendance npm. Deux registres.

| Registre | Famille | Emploi |
|---|---|---|
| Affichage | `--font-display` — Archivo Variable | Titres, libellés en capitales, contrôles |
| Interface | `--font-ui` — pile système | Corps de texte, valeurs techniques |

Axes variables consommés par `font-weight` et `font-stretch`, **jamais** par
`font-variation-settings` : les propriétés natives héritent et s'animent, la
notation bas niveau non.

- `--display-weight: 800`, `--display-stretch: 112%` — affichage en capitales,
  extrémité lourde de l'axe, interlignage `--leading-tight: 1.02`.
- `--label-weight: 600`, `--size-label: 0.8125rem` — libellés en capitales de
  **13 px, non fluides**, comme la référence. Interlettrage `0.06em`.
- Échelle fluide `--step--1` à `--step-6`, en `clamp()`.
- `font-variant-numeric: tabular-nums` partout où un chiffre apparaît. Les
  chiffres sont de la preuve, ils doivent s'aligner en colonne.

**Poids réel : 90 104 octets** (88 Ko). Ce n'est pas le poids annoncé lors du
choix de la police (~30 Ko) : aucun `fonttools` n'est disponible sur la machine
pour sous-ensembler le fichier. L'`unicode-range` déclaré restreint les codes
appelés, pas l'octet téléchargé. À reprendre si le budget de performance se
tend — Lighthouse ≥ 95 sur mobile est une contrainte du contrat.

Licence **OFL-1.1**. Le texte accompagne le fichier servi, dans
`public/fonts/OFL.txt`, comme l'OFL l'exige de toute copie redistribuée.

## 4. Espacement et mise en page

Échelle de 4 px, `--space-3xs` (0,25 rem) à `--space-3xl` (9 rem). La mise en
page se cale sur des unités entières de cette échelle et assume ses coutures,
plutôt que de les cacher derrière des gouttières fractionnaires.

- `--measure: 68ch` — longueur de ligne maximale du texte courant.
- `--page-max: 90rem`, `--page-gutter: var(--space-s)`.
- Mobile first. Le mixin `respond-up()` de `app/styles/_breakpoints.scss` est le
  **seul** emploi de variables Sass pour une valeur de design : le CSS natif
  n'accepte pas de custom property dans une media query.

## 5. Formes

- **La page se divise par des filets.** Rien n'est enfermé dans une carte, rien
  ne porte d'ombre. `--rule` et `--rule-strong` sont les deux filets.
- **Les contrôles sont des rectangles à filet.** Les formes en pilule sont
  réservées à la taxonomie — tags, catégories — et à rien d'autre.
- **Le rang s'encode dans la taille du texte**, pas dans une grille uniforme de
  cartes égales. L'ordre d'affiche est la hiérarchie.
- **Une surface, une passe.** La preuve reste sur la page. Rien ne se cache
  derrière un survol ou un accordéon : ni le clavier ni le tactile n'ont de
  survol.
- Cible tactile **44 px** minimum sur tout contrôle (RGAA 4.1).
- `--color-focus` est visible dans les deux thèmes et ne se supprime jamais.

## 6. Mouvement

`--dur-fast` 120 ms, `--dur-base` 240 ms, `--dur-slow` 480 ms,
`--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`.

Toute transition se neutralise sous `prefers-reduced-motion: reduce`. Aucune
animation ne porte d'information : elle accompagne un changement d'état déjà
lisible sans elle.

## 7. Organisation du code

**Un seul système : Atomic Design.** ITCSS a été abandonné le 26/10/2026 —
faire tourner deux systèmes d'organisation en parallèle dupliquait les règles,
et quatre des sept couches ITCSS ne contenaient qu'une ligne de commentaire.

Le SCSS global ne porte que ce qui ne peut pas être scopé :

```
app/styles/
├── _tokens.scss       custom properties, thémables à l'exécution
├── _fonts.scss        @font-face
├── _reset.scss        remise à zéro
├── _base.scss         styles d'éléments
├── _breakpoints.scss  mixin respond-up()
└── main.scss          point d'entrée
```

Tout le reste vit dans le `<style scoped>` du composant qui en a besoin.

**Aucun composant spéculatif.** Un composant naît de la page qui en a besoin,
jamais pour cocher une case. Les six atomes écrits le 26/10 ont été supprimés
pour cette raison : `Input` et `Button` ne servaient qu'au formulaire de
contact, dont le fournisseur n'est pas tranché (issue
[#5](https://github.com/arnaudbregere/portfolio/issues/5)).

## 8. Périmètre de design

- **Le CV n'est qu'un document à télécharger.** La page `/cv` en HTML que
  `PRODUCT.md` spécifiait est hors périmètre depuis le 26/10/2026.
- Aucune capture de Figaro Classifieds ni du Groupe La Poste : elles sont
  propriétaires. C'est la contrainte qui a fait naître l'encre d'annotation.
- Une seule police d'affichage chargée.
- Lighthouse ≥ 95 sur mobile, RGAA 4.1 / WCAG 2.1 AA.
