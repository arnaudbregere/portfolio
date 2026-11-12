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
| `--color-logo-ink` | Marque : lettre `a`, prénom, survols | `#ff5c72` | `#ff5c72` |
| `--color-logo-ink-fg` | Texte sur la marque | `#121110` | `#121110` |
| `--color-focus` | Indicateur de focus | `var(--color-fg)` | `var(--color-fg)` |

### L'icône du site

Les **cinq** icônes de `public/` — `favicon.svg`, `favicon-32.png`,
`favicon-192.png`, `favicon.ico` et `apple-touch-icon.png` — reprennent le
monogramme « ab », composées par `scripts/favicon.js` depuis les tracés de
`app/components/atoms/Logo.vue`. Le dessin n'est pas recopié : il est lu dans
l'atome, son cadrage s'en déduit, et `tests/unit/favicon.spec.ts` vérifie que
les fichiers livrés portent bien les tracés d'aujourd'hui.

Le 192 est la taille que Google lit pour poser une icône à côté d'un résultat
de recherche sur mobile : un carré d'un multiple de 48 px. Il redimensionne
mal le 32, et le 180 d'iOS n'est pas un multiple.

Trois écarts à l'atome, assumés le 12/11/2026 (issue #53), parce qu'une icône
est un fichier et non un composant :

- **Le `b` ne suit plus le thème du site.** Il prend `currentColor` dans
  l'atome ; un fichier n'a pas de couleur courante. Le SVG porte donc un
  `prefers-color-scheme` — `#14120f` en clair, `#f2efe9` en sombre — qui suit
  le réglage du **système d'exploitation**, pas la bascule de la page. Un
  visiteur qui force le thème clair sur un système sombre verra l'icône
  sombre. L'onglet appartient au navigateur ; la page n'y a pas de prise.
- **Les rasters sont posés sur une tuile papier** `#f7f4ef`, et non en
  transparence : le `b` en encre sombre disparaîtrait sur la barre d'onglets
  sombre de Chrome, et iOS remplace la transparence par du noir.
- **Le cadrage est refait.** La boîte des tracés fait 51,05 × 36,85 ; une
  icône est carrée. Le script lit le `viewBox` de l'atome — qui est cette
  boîte — et en calcule un carré centré, côté = plus grande dimension plus
  deux marges de 2,5. Aucun nombre n'est recopié : un monogramme redessiné
  reste cadré.

Le `a` garde `--color-logo-ink` en dur dans les cinq fichiers : la marque ne
change pas de couleur avec le fond, ici comme ailleurs.

Le papier est chaud plutôt que blanc pur : cela désamorce le risque d'austérité
d'un monde privé de photographie. L'encre garde la même teinte d'un thème à
l'autre (350° contre 353°), seulement éclaircie pour tenir son seuil sur fond
sombre.

**Le focus n'ajoute aucune couleur.** `--color-focus` renvoie à `--color-fg`.
Un bleu dédié (`#1a5fff` en clair, `#7aa2ff` en sombre) a été écarté le
03/11/2026 : il faisait deux couleurs saturées dans une palette qui n'en promet
qu'une. L'indicateur se distingue donc par le trait, pas par la teinte — 3 px
plutôt que 2 — et son décalage de 3 px le pose sur le fond de page, jamais sur
la surface de l'élément : un bouton rempli en `--color-fg` masquerait un
contour de la même encre.

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
| `focus` / `bg` | 1.4.11 | 3:1 | 17,04:1 | 16,44:1 |

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
- **Le chapeau est le paragraphe qui suit le titre**, stylé par `h1 + p` dans
  `_base.scss` : `--step-1` en texte secondaire. Aucune classe ne nomme ce que
  la structure exprime déjà.

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

**Un seul token de l'échelle varie avec la fenêtre : `--space-2xl`**, qui ouvre
le séparateur de rubrique de toutes les pages. Il vaut **4 rem en mobile et
6 rem à partir de `m`** (48 em / 768 px). Six rem partout vidaient l'écran d'un
téléphone entre deux titres — plus d'un tiers de la hauteur utile pour un
intervalle. Tranché le 12/11/2026 (issue #53). La variante vit dans
`_tokens.scss`, avec la valeur : la chercher ailleurs coûterait plus que la
media query qu'elle y introduit.

Conséquence assumée : **sous 48 em, `--space-xl` et `--space-2xl` valent tous
deux 4 rem.** L'échelle a donc un doublon en mobile, et le séparateur de
rubrique n'y est plus distinct du cran du dessous. C'est le prix du resserrage
— un `--space-2xl` mobile à 3 rem passerait sous `--space-xl`, ce qui
retournerait l'échelle. Les rubriques restent séparées par leur filet.

- `--measure: 68ch` — longueur de ligne maximale du texte courant.
- `--page-max: 90rem`, `--page-gutter: var(--space-s)`.
- **Le cadrage appartient au gabarit.** `app/layouts/default.vue` pose la
  gouttière et la largeur maximale ; aucune page ne repose les siennes, sans
  quoi deux pages dérivent l'une de l'autre au premier ajustement.
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
- **Un bloc de premier niveau porte son rang en figure numérotée.** Décision
  d'Arnaud du 09/11/2026 (issue #32) : les quatre rubriques de `/a-propos`, et
  chaque projet de `/projets`. Le chiffre est en encre atténuée, à la taille
  de libellé, en chiffres tabulaires. Il vient d'un compteur CSS, donc il
  n'est écrit dans aucun gabarit et se renumérote seul quand un bloc bouge ou
  qu'un projet s'ajoute.

  **Sans zéro de tête, et suivi d'un point**, décision du 09/11/2026 qui
  revient sur le premier jet : `1.`, `2.`, `3.`, et non `01`, `02`, `03`. Le
  point rattache le chiffre au titre qu'il numérote, au lieu de le laisser
  flotter comme une étiquette posée à côté. La surcouche de navigation
  garde ses deux chiffres — elle numérote quatre rubriques fixes comme une
  planche, et son `01` tient une colonne de libellés alignés. Dans le corps
  d'une page, le chiffre accompagne un titre et n'aligne rien : le zéro n'y
  est qu'un ornement.
  L'écart entre le rang et le titre est d'un `--space-2xs` : le chiffre
  accompagne le titre, il ne s'en détache pas. Il vaut 21,86 px rendus, et
  doit être le même sur toutes les pages — un libellé passé à la ligne dans
  son `h2` ajoute une espace à la taille du titre et creuse l'écart sans
  qu'aucune marge ne change.
- **Un élément de second niveau porte une puce.** Même décision. Sous un titre
  numéroté, la puce dit qu'une expérience ou une formation est un élément de
  la rubrique, et non une rubrique de plus : le document a deux niveaux, il
  les montre. La puce est en encre atténuée. Les listes du site restent
  autrement sans marqueur, `_reset.scss` les ayant toutes remises à plat.
- **Les deux marqueurs ne se cumulent jamais sur un même bloc.** `/projets`
  n'a qu'un niveau — sa liste de projets — et ses projets sont donc numérotés
  sans puce : le rang et la puce diraient deux fois la même chose, et
  l'ordre y porte une information que la puce ne porte pas.
- **Une surface, une passe.** La preuve reste sur la page. Rien ne se cache
  derrière un survol ou un accordéon : ni le clavier ni le tactile n'ont de
  survol.
- **Un lien qui sort du site porte une flèche `↗`**, un cran plus petite que
  son libellé, et s'ouvre dans un nouvel onglet. Décision du 04/11/2026
  (issue #22) : le site est une pièce de candidature, il doit rester ouvert
  derrière le dépôt que le lecteur part inspecter. La flèche est
  `aria-hidden` ; la mention « nouvel onglet » l'accompagne en texte masqué
  visuellement, parce qu'un changement de contexte sans annonce désoriente au
  lecteur d'écran et que « page précédente » ne ramène pas en arrière dans un
  onglet neuf. Un lien de même origine que le site n'en porte pas.
- **Un seul bouton de libellé, et une seule taille.** « Menu », « Fermer » et
  la bascule de thème partagent l'atome `Button` : même hauteur
  (`--control-min-height`), même largeur minimale (`--control-min-width`), même
  filet, même typographie. Décision du 09/11/2026 (issue #34), prise sur trois
  copies du même bloc de style qui avaient déjà divergé. La largeur minimale
  tient « Menu » et « Fermer » à la même place, pour que la surcouche ne décale
  pas le bouton qui l'a ouverte ; `white-space: nowrap` tient la hauteur, un
  libellé passé sur deux lignes grandissant le bouton et désalignant ses
  voisins. Les trois n'ont pas la **même** largeur : « Thème sombre » est le
  double de « Menu », et l'imposer à tous ferait déborder l'en-tête mobile.
- **Une coordonnée joignable porte son pictogramme.** Décision d'Arnaud du
  09/11/2026 : le téléphone et l'e-mail en portent un sur `/contact` comme
  dans la liste « Me joindre » de `/a-propos`, par l'atome `Icon`. Le
  pictogramme est `aria-hidden` et ne porte jamais le sens : le libellé du
  lien reste la seule source d'information. Une ligne qui n'est pas une
  coordonnée joignable — la ville — n'en a pas, et son retrait l'aligne sur
  celles qui en ont un.
- **La signature de l'en-tête est un monogramme `ab`.** Décision d'Arnaud du
  09/11/2026. Le nom en toutes lettres cède la place à deux minuscules
  serrées, le `b` chevauchant la panse du `a`.

  Une première version le composait **en texte**, par les axes d'Archivo
  Variable et un interlettrage négatif poussé jusqu'à `-0.19em`. Arnaud a
  ensuite dessiné le monogramme sur Figma, et c'est ce dessin qui fait foi :
  les deux lettres s'y recouvrent d'une façon qu'aucun interlettrage ne
  reproduit, puisque `letter-spacing` déplace des glyphes entiers et ne
  redessine rien.

  **Les tracés sont écrits dans le composant, pas chargés en fichier.** Figma
  rendait deux fichiers qui ne différaient que par la couleur du `b` — blanc
  dans l'un, noir dans l'autre. Inscrits dans l'atome, le `b` prend
  `currentColor` et le `a` l'encre d'annotation : un seul tracé sert les deux
  thèmes, sans requête, et la bascule est suivie — elle pose un attribut sur
  `<html>`, qu'un `<picture>` sur `prefers-color-scheme` aurait ignoré.

  **Le `a` garde `#ff5c72` dans les deux thèmes**, par son propre token
  `--color-logo-ink`. Décision d'Arnaud : une marque a une couleur, elle n'en
  change pas avec le fond. Seul le `b` bascule, du noir au blanc.

  Ce rose donne **2,72:1** sur le papier clair et **6,31:1** sur le fond
  sombre. Le premier chiffre est sous le plancher de 3:1 de WCAG 1.4.11, et
  **ce plancher ne s'applique pas ici** : le critère vise les graphiques
  nécessaires à la compréhension, et WCAG exempte nommément les logotypes. Le
  monogramme est `aria-hidden`, le nom du lien est du texte — la marque est
  décorative, rien ne se perd à ne pas la distinguer.

  Ce token ne rejoint donc pas les couples à seuil de
  `tests/unit/contrast.spec.ts` : un seuil y affirmerait une exigence qui
  n'existe pas. Il y entre comme **valeur mesurée**, pour qu'une retouche de
  la couleur fasse re-mesurer le test au lieu de passer inaperçue.

  `--color-ink`, l'encre d'annotation, reste distincte : elle sert du texte,
  bascule avec le thème et tient 6,3:1 en clair. Les deux ont la même valeur
  en thème sombre, par coïncidence de teinte, et ne doivent pas être
  confondues.

  **Le `viewBox` est resserré sur la boîte des tracés**, relevée au navigateur
  par `getBBox`. L'export Figma rendait des marges inégales — 1,5 à gauche
  contre 9,45 à droite — qui auraient décalé le monogramme sans qu'aucune
  règle ne le dise.

  **Le monogramme ne bouge pas au survol.** Une respiration a été essayée le
  même jour — la chasse qui s'ouvre, l'interlettrage qui se détend — et
  retirée par Arnaud : une signature est un repère fixe, et celle-ci est le
  premier élément de chaque page. Il n'y a donc aucune indication de survol,
  comme sur le nom qu'elle remplace ; le focus clavier reste couvert par le
  `:focus-visible` global.

  Le nom reste dans l'arbre d'accessibilité : le monogramme est `aria-hidden`,
  et « Arnaud Brégère » le suit en `.visually-hidden`. Le pied de page garde
  le nom en toutes lettres. Le relevé mobile de § 6 ne peut que s'améliorer :
  le monogramme est plus étroit que les 113 px de la signature mesurée à
  393 px.

  **Son lien porte la cible tactile des contrôles**, 44 px, que la hauteur de
  son texte n'atteint pas toujours. L'ancien nom à 13 px donnait un lien de
  16 px de haut : le défaut est ancien, il se corrige ici.
- **Le nom de l'accueil se lit en minuscules, d'un seul tenant.** Décision
  d'Arnaud du 09/11/2026 : `arnaudbrégère`, le prénom à l'encre et le nom à
  la couleur du texte, les deux mots soudés par un `word-spacing` négatif.
  C'est l'écho du monogramme, à l'échelle du titre : même geste, deux lettres
  d'un côté, deux mots de l'autre.

  **La minuscule est posée par le style**, pas par le contenu :
  `content/cv.ts` garde « Arnaud Brégère » avec ses capitales, donc le texte
  de la page, le nom accessible et ce que lisent les moteurs ne changent pas.
  L'espace entre les deux mots est conservée pour la même raison — c'est elle
  que `word-spacing` resserre, et c'est elle qui fait entendre deux mots.

  **Le resserrement est en `em`, pas en pixels.** Il vaut les -32 px de la
  maquette à la taille maximale du titre, 89,76 px, mais `--step-6` descend à
  44,8 px en mobile, où -32 px feraient entrer le second mot dans le premier.

  **Sa taille est bornée par la largeur disponible.** Le nom soudé mesure
  7,99 fois sa taille de police — rapport mesuré dans Chrome et constant,
  puisqu'il ne dépend que des métriques de la fonte. `--step-6` l'ignore : à
  416 px de large il rend 48,99 px, soit un nom de 391 px pour 384 px
  disponibles. Le nom passait à la ligne, et la marge négative qui soude les
  deux mots débordait alors à gauche en seconde ligne, où l'`overflow-x` de
  l'entrée la rognait. Un `min()` borne donc la taille à ce que la gouttière
  laisse ; il l'emporte sous 436 px environ. Le titre porte `nowrap` : un nom
  soudé qui passe à la ligne n'a aucun sens.

  **Il passe par une marge, et non par `word-spacing`.** Entre deux boîtes en
  ligne — ce que les deux mots sont devenus en recevant chacun son `span` pour
  l'entrée — l'effet négatif de `word-spacing` est **plafonné** : les mots se
  touchent sans se recouvrir. Mesuré dans Chrome : passer de `-0.3565em` à
  `-0.48em` ne changeait plus rien, alors qu'avec un seul `span` le titre
  continuait de se resserrer. Une `margin-inline-start` négative sur le second
  mot n'est pas plafonnée et rend le dessin exact.

  **Le prénom prend `--color-logo-ink`, et c'est un écart assumé.** Décision
  d'Arnaud, prise sur la mesure : le prénom porte la couleur de la marque
  dans les deux thèmes, comme le `a` du monogramme, parce que le titre est
  l'écho du logo et qu'une marque ne change pas de couleur avec le fond.

  Le coût est connu et chiffré. Un titre est du texte, donc WCAG 1.4.3 lui
  demande 4,5:1, ou 3:1 à partir de 24 px en gras — ce titre fait 89,76 px.
  `#ff5c72` donne **2,72:1** sur le papier clair : le mot « arnaud » échoue
  au seuil en thème clair. En thème sombre il tient **6,31:1**.

  L'exemption des logotypes ne couvre pas ce cas : elle vaut pour une image
  de marque, pas pour le `h1` d'une page. Le mot reste lisible — c'est un
  rose soutenu sur papier chaud, pas un gris sur gris — mais le critère n'est
  pas tenu, et le nom est porté une seconde fois par le `h1` lui-même, dont
  la seconde moitié est à `--color-fg`. `--color-ink` le ramènerait à 6,3:1
  en clair, au prix d'un prénom plus sombre que la marque.

  Depuis le 10/11/2026, l'audit `@axe-core/playwright` de
  `e2e/tests/accessibilite.spec.ts` relève cet écart et lui seul. La tolérance
  y est nominative — une règle, un sélecteur, une page, un thème — et la spec
  échoue aussi si l'écart **disparaît** : une exception qui survit à ce qu'elle
  excusait finit par couvrir autre chose. Reprendre ce paragraphe le jour où
  elle tombe.
- **Le survol du lien de CV passe à la couleur de marque.** Décision d'Arnaud
  du 09/11/2026 : le fond et le filet prennent `--color-logo-ink`, dans les
  deux thèmes. Le lien s'inversait jusque-là en encre pleine.

  Son texte prend `--color-logo-ink-fg` et non `--color-ink-fg`, qui vaut
  blanc en thème clair : le blanc ne tient que **2,99:1** sur ce rose, quand
  `#121110` en tient **6,31**. Ici le seuil s'applique — c'est du texte sur un
  fond, pas un logotype — et le couple rejoint donc les couples verrouillés de
  `tests/unit/contrast.spec.ts`.
- Cible tactile **44 px** minimum sur tout contrôle (RGAA 4.1).
- `--color-focus` est visible dans les deux thèmes et ne se supprime jamais. Il
  reprend `--color-fg` : le contraste est le plus élevé de la palette.

## 6. Navigation

**Deux formes de navigation, séparées par un point de rupture.** Décision
d'Arnaud du 09/11/2026 (issue #34), qui renverse celle de P2 — « le menu est
plein écran à toutes les largeurs ».

Sous **768px** (`respond-up(m)`), le menu est plein écran, ouvert par un
déclencheur « Menu ». À partir de 768px, les quatre rubriques s'affichent en
clair dans l'en-tête et le déclencheur disparaît.

Ce que la décision de P2 défendait, et ce qui lui est préféré :

- « C'est la forme des deux références épinglées. » Elle le reste en mobile. En
  desktop, un visiteur qui doit ouvrir une surcouche pour savoir ce que le site
  contient paie un clic pour une information que la place permet de donner. Le
  site est une pièce de candidature, lue le plus souvent sur un écran large.
- « Une barre horizontale impose quatre libellés de même taille, donc une
  hiérarchie plate. » Le rang reste encodé là où il porte : les chiffres `01`
  à `04` restent dans la surcouche mobile et **n'entrent pas dans la barre**.
  La barre est un index, pas une affiche.
- « Une seule forme à dessiner, à tester et à maintenir accessible. » C'est le
  coût assumé de la décision. Il se borne par une règle : **une seule des deux
  formes est dans l'arbre d'accessibilité à la fois**, l'autre est en
  `display: none` — jamais masquée visuellement seulement, ce qui laisserait
  deux chemins de navigation à un lecteur d'écran.

**La surcouche se ferme au franchissement du point de rupture.** Ouverte en
mobile puis la fenêtre élargie, elle resterait sinon ouverte sans déclencheur
pour la refermer.

**Chaque rubrique porte son rang dans la surcouche mobile**, de `01` à `04`,
en chiffres tabulaires et au corps des libellés. C'est la figure numérotée du
contrat de direction : la hausse empruntée à la planche de brevet, qui reporte
sur le numéro et sur l'encre la charge que le monde de référence fait porter à
la photographie.

**Le menu est un `<dialog>` ouvert par `showModal()`.** Le piège à focus, la
fermeture par `Échap` et la restitution du focus au déclencheur sont alors
tenus par le navigateur. `PRODUCT.md` exige les trois ; les réécrire à la main
n'ajouterait rien et introduirait l'endroit précis où ce code se casse.

**L'en-tête suit le défilement.** Sur une page longue, un menu qu'il faut
remonter chercher n'est pas un menu. L'en-tête reste donc collant, sur le fond
de page et sous un filet.

**Le pied de page porte la navigation en clair, et rien d'autre.** `PRODUCT.md`
exige que le site reste lisible sans JavaScript, et une surcouche plein écran ne
s'ouvre pas sans lui. Le pied de page est le chemin de repli ; il n'est pas la
navigation principale.

GitHub et LinkedIn l'ont quitté le 09/11/2026 (issue #34), en même temps que la
bascule. Ils ne vivent plus qu'à un endroit, `/contact`, que `PRODUCT.md` désigne
pour les porter. Un pied de page qui reprend tout devient un second sommaire, et
une adresse écrite à deux endroits est une adresse à tenir à jour deux fois.

**La rubrique courante passe à l'encre**, dans la barre, dans la surcouche
comme dans le pied de page. `NuxtLink` pose `aria-current="page"` :
l'information ne repose jamais sur la seule couleur.

**La bascule de thème vit dans l'en-tête, à toute largeur, en une seule
instance.** Décision d'Arnaud du 09/11/2026 (issue #34). Elle était au pied de
page, donc hors de vue sur une page longue, alors qu'elle change la page entière
et à tout moment.

En desktop elle se place **en bout de barre**, après la dernière rubrique : elle
agit sur la page et non sur la navigation, et la placer avant « Accueil » la
ferait lire comme une cinquième entrée. En mobile elle se place **à gauche du
déclencheur « Menu »**, dans le même groupe, à droite de la signature.

Une première version la réservait au desktop, l'en-tête mobile paraissant trop
étroit pour trois éléments. La mesure a tranché l'inverse : les échelles de
texte et d'espacement étant fluides, les libellés rétrécissent avec la fenêtre.
Relevé dans Chrome à **393px** : signature 113px, bascule 126px, déclencheur
76px, deux écarts de 16px et 32px de gouttières, soit **379px** — aucun
débordement.

**La bascule garde la même largeur dans les deux thèmes.** « Thème clair » est
plus court que « Thème sombre » : sans réserve, le bouton rétrécit au clic et
toute la barre se décale. Le libellé de l'autre thème est donc rendu dans la
même case de grille, invisible et hors de l'arbre d'accessibilité. Pas de
largeur minimale en dur, qui deviendrait fausse au premier changement de police
ou de libellé.

**La bascule est un bouton unique, nommé par son action** — « Thème sombre »
quand le thème courant est clair. Un groupe de deux boutons `aria-pressed` a été
écarté : avant le premier clic la préférence vaut `system`, et un
`aria-pressed="true"` affirmerait un choix que le visiteur n'a pas fait.

## 7. Mouvement

`--dur-fast` 120 ms, `--dur-base` 240 ms, `--dur-slow` 480 ms,
`--dur-slower` 900 ms, `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`.

`--dur-slower` ne sert qu'à l'entrée du nom de l'accueil : c'est la seule
figure du site qui traverse une distance, les autres montent d'un pas.

Toute transition se neutralise sous `prefers-reduced-motion: reduce`. Aucune
animation ne porte d'information : elle accompagne un changement d'état déjà
lisible sans elle.

**Le soulignement d'un lien se fond en `--dur-fast`.** Décision du 04/11/2026.
Le trait est toujours là, en `text-decoration-color: transparent` ; le survol
et le focus le ramènent à `currentColor`. La transition porte donc sur une
couleur, pas sur l'apparition d'un trait : rien ne se décale, et la hauteur de
ligne ne bouge pas.

**Un lien dans de la prose reste souligné en permanence**, ainsi que dans une
liste qui mêle liens et texte : le trait y est le seul repère qui distingue le
lien du texte sans recourir à la couleur (WCAG 1.4.1). Ces liens ne passent pas
par `SiteLink` — la liste « Me joindre » de `/a-propos`, où la ville n'est pas
un lien, en est le cas.

La règle vit dans la molécule `SiteLink`, et nulle part ailleurs : le
soulignement est une propriété du lien, pas de la page qui l'affiche. Tout lien
de libellé passe par ce composant — interne comme sortant. Aucun mixin, aucune
classe utilitaire : un seul système d'organisation, Atomic Design.

**Une page peut entrer en deux mouvements.** Décision du 05/11/2026, prise sur
`/contact` (issue #5).

Le premier : les textes montent d'un pas en prenant leur opacité (`opacity`
de 0 à 1, `translate: 0 var(--space-s)` à 0), en `--dur-slow`. Le second : le
filet qui divise la page se tire de gauche à droite (`transform: scaleX(0)`
à 1, `transform-origin: left`), en `--dur-slow` également. La page se construit
depuis ses lignes, cohérente avec une maquette qui divise par des traits et
jamais par des cartes.

Les quatre temps s'enchaînent à **140 ms** d'écart — titre, nom, filet, puis
chaque coordonnée : assez pour que l'œil suive le sens de lecture, trop peu
pour faire attendre. Une première version tenait en `--dur-base` sur 0.5 rem
avec 60 ms d'écart ; relue sur écran, elle passait inaperçue. Un mouvement qui
ne se voit pas ne vaut pas son code : il se règle jusqu'à être lisible, ou il
se retire.

Trois contraintes tiennent cette figure :

- **`opacity` et `transform` seules.** Ce sont les deux propriétés que le
  navigateur compose sans recalculer la mise en page. Animer une hauteur, une
  marge ou un `top` ferait saccader un mobile d'entrée de gamme.
- **Le filet est un pseudo-élément, pas une bordure** : une bordure ne se met
  pas à l'échelle.
- **Les délais se remettent à zéro** sous `prefers-reduced-motion: reduce`. La
  règle globale de `_reset.scss` écrase les *durées*, pas les *délais* : sans
  cette remise à zéro, la page resterait vide le temps de la cascade. Même
  parade que dans `NavOverlay`.

**Une rubrique peut entrer à son arrivée dans la fenêtre.** Même décision,
même page. Elle **joue** alors sa cascade — titre puis lignes, 90 ms d'écart,
même courbe qu'au chargement. Le rythme appartient à la page et non à la
vitesse de la molette, et remonter ne rejoue rien.

Une chronologie de défilement (`animation-timeline: view()`) a été essayée
d'abord et écartée : elle *pilote* l'opacité image par image depuis la position
de défilement, donc l'entrée se joue à la vitesse du pouce, s'inverse quand on
remonte, et demande une plage réglée à la main que la longueur de la page peut
rendre injouable. Un `IntersectionObserver` déclenche au lieu de piloter, et se
passe de la réserve Firefox.

Cinq conditions, mesurées sur `/contact` dans Chrome 157 :

- **Le classement porte sur la rubrique entière, jamais sur ses lignes.** Une
  rubrique à cheval sur la ligne de flottaison aurait ses premières lignes dans
  la cascade et les suivantes en attente ; l'observateur libérerait ces
  dernières aussitôt, avec leur propre compte à rebours, et elles
  apparaîtraient **avant** celles du dessus. Mesuré : `Contrat` partait à 0 ms
  quand `Statut`, juste au-dessus, attendait 1060 ms.
- **Ce qui tient dans la fenêtre au chargement n'a pas d'arrivée à attendre.**
  La frontière dépend de la hauteur de la fenêtre et de la longueur de la page,
  jamais du rang de la rubrique — **elle se mesure**. `useRevealCascade` la
  mesure au premier rendu et répartit.
- **Le rang court d'une rubrique à l'autre.** La cascade du chargement est une
  seule phrase, pas une suite de départs qui se chevauchent ; une rubrique en
  attente n'y réserve aucun rang.
- **Le défaut est l'entrée au chargement, et le JavaScript ne fait que
  retirer.** Dans ce sens, rien ne clignote — une ligne retirée est encore à
  l'opacité 0 quand on la retire — et une page dont le JavaScript ne s'exécute
  jamais garde une entrée complète. L'état d'attente ne porte **aucune**
  animation : un état stable, et non une animation figée en son milieu.
- **La mesure attend `document.fonts.ready`.** Prise plus tôt, elle lit une
  mise en page sans sa police : mesuré sur `/contact`, une ligne à 1039 px
  d'une fenêtre de 1163 px était classée hors champ parce que tout descendait
  encore. Le retard est sans danger, le premier délai de la cascade étant de
  700 ms.

Sous `prefers-reduced-motion: reduce`, le composable ne fait rien : masquer en
attendant un défilement serait un mouvement de plus, pas un de moins.

**Une seule exception : le nom de l'accueil.** Décision d'Arnaud du
09/11/2026. Le prénom entre par la gauche, le nom par la droite, et le
chevauchement les soude à l'arrivée : le mouvement raconte ce que la forme
fixe montre, deux mots qui n'en font qu'un. La course est de **`1.5em`** en
`--dur-slower`, réglées ensemble sur retour d'Arnaud — une première version à
`0.4em` en `--dur-slow` passait trop vite et de trop peu. La course est en
`em`, donc elle suit la taille du titre au lieu d'être figée en pixels.

Le nom sort de sa boîte pendant l'entrée. Vers la gauche, un débordement n'est
jamais défilable ; vers la droite, il le serait, et une fenêtre à peine plus
large que `--page-max` gagnerait une barre horizontale le temps de l'animation.
Le titre porte donc `overflow-x: clip` avec une marge de rognage plus large que
la course : rien de visible n'est coupé, aucun conteneur de défilement n'est
créé, et le `position: sticky` de l'en-tête survit — ce que `overflow: hidden`
aurait cassé.

Le nom ne prend plus `page-entry` : ses deux mots portent l'entrée à sa place,
sinon le titre monterait **et** s'écarterait. Le reste de la tête de page —
ligne de compétences, présentation, téléchargement — garde la figure commune et
ses 140 ms d'écart.

C'est le seul endroit du site où l'entrée n'est pas la figure commune, et c'est
assumé : le nom est le premier mot de la première page, et le monogramme de
l'en-tête fait déjà de ces deux lettres soudées la marque du site. Sous
`prefers-reduced-motion: reduce`, les deux mots n'ont plus d'animation du tout
— la règle globale de `_reset.scss` écrase la durée mais pas le tracé, donc
sans cette remise à zéro ils apparaîtraient décalés.

**Cette figure est celle du site, pas celle d'une page.** Décision d'Arnaud du
05/11/2026 : `/contact` a servi de terrain d'essai, et `/`, `/projets`,
`/projets/[slug]` et `/a-propos` reprendront la **même** entrée — mêmes
durées, même pas de 90 ms, même répartition entre ce qui se lit sans défiler
et ce qui attend son arrivée. Une page qui s'anime autrement qu'une autre se
remarque, et ce qui se remarque dans une pièce de candidature doit être le
travail, pas le décor.

En conséquence, l'outillage est déjà commun : `useRevealCascade` et
`revealPlan` ne connaissent rien de `/contact`, ils prennent des rubriques et
rendent des délais. Une page les adopte en marquant ses rubriques
`data-reveal-section` et ses lignes `data-reveal-item`.

**Le filet tiré est le geste d'ouverture d'une page, une fois par page.**
Décision d'Arnaud du 09/11/2026, prise avant la reprise de la figure sur les
autres rubriques (issues #29 à #32).

Les séparateurs de rubrique de `/`, `/projets`, `/a-propos` et de la fiche
projet sont des `border-top: var(--rule-strong)`, et le restent : **statiques**.
Une page sans bloc d'ouverture à filet — `.contact__list--lead` en est le seul
cas — n'a donc aucun filet tiré, seulement le premier mouvement, les textes qui
montent. La règle est structurelle et non par page : un filet tiré accompagne un
bloc d'ouverture, quand la page en a un. Deux pages ne divergent pas, c'est leur
structure qui diffère.

Trois raisons :

- **Animer un séparateur demanderait un délai à la rubrique elle-même**, concept
  qui n'existe pas : `useRevealCascade` pose `--reveal-delay` sur les lignes
  (`[data-reveal-item]`), jamais sur les rubriques. Il faudrait étendre
  `revealPlan` et le composable, poser `position: relative` et un `::before` sur
  quatre composants, et neutraliser l'animation du filet dans l'état `pending`.
  Trois ajouts dans un outil qui ne connaît aujourd'hui aucune page, pour de la
  décoration.
- **Un trait déjà posé donne au texte qui monte un repère fixe contre lequel
  arriver.** La figure garde un point d'appui, et une rubrique en attente est un
  cadre vide qui se remplit, non une page trouée.
- **Répété sur cinq séparateurs, le geste devient un tic.** Ce qui se remarque
  dans une pièce de candidature doit être le travail.

Écarté : ajouter un filet d'ouverture aux quatre pages pour uniformiser le
geste. Cela ajoute un trait que la maquette ne demande pas, sur quatre pages,
pour justifier une animation.

**Le `@keyframes` est partagé depuis le 09/11/2026**, dans
`app/styles/_motion.scss` (issue #29). Il y est passé à la deuxième page qui a
repris la figure, comme cette section l'exigeait : un `@keyframes` partagé ne
peut pas vivre dans un `<style scoped>`, qui le renommerait pour chaque
composant, et c'est le seul fichier global de mise en forme que `frontend.md`
autorise. Le fichier porte aussi les règles qui accompagnent le `@keyframes` —
l'animation des lignes marquées, l'état d'attente, et la remise à zéro des
délais.

Ce qui reste scopé dans chaque page : les délais fixes de sa tête de page, qui
dépendent de ce qu'elle y met, et le filet tiré de son bloc d'ouverture quand
elle en a un.

**Une rubrique de cascade ne dépasse pas la hauteur de la fenêtre.** Décision
du 09/11/2026, prise sur `/a-propos` (issue #32) après un retour d'Arnaud.

`useRevealCascade` classe une rubrique sur son `top` seul : au-dessus de la
ligne de flottaison elle entre au chargement, en dessous elle attend son
arrivée. Ce classement ne vaut donc que si la rubrique tient à peu près dans la
fenêtre. Mesuré : « Parcours » pris pour une seule rubrique faisait **2296 px**
dans une fenêtre de 1047 px, et son `top` était à 632 px. Ses cinq expériences
partaient donc toutes au chargement, les quatre dernières jouaient leur entrée
**hors écran**, et au défilement elles étaient déjà entrées — immobiles, alors
que `/contact` les aurait fait monter.

Donc : **une rubrique de page dont le contenu est une liste se découpe en une
rubrique par élément.** Sur `/a-propos`, « Parcours » (une expérience) et
« Formation » (une formation). Aucune rubrique ne dépasse alors 695 px. La
règle est structurelle : ce n'est pas le nombre d'éléments qui décide, c'est la
hauteur comparée à la fenêtre.

« Formation » n'avait pas été signalée, et relevait du même défaut : 1125 px
pour une fenêtre de 1047 px. Le défaut y était seulement latent — visible sur
une fenêtre plus courte.

**Le titre d'une telle rubrique est une rubrique d'une seule ligne.** Un `h2`
suivi d'une liste découpée en rubriques n'a aucun descendant à marquer : il
porte alors `data-reveal-section` **et** `data-reveal-item`, et se classe sur
son propre `top`. `useRevealCascade` compte une rubrique comme sa propre ligne
quand elle est marquée ainsi.

C'est le seul ajout que la figure ait demandé à l'outillage commun depuis
`/contact`, et il n'était pas évitable : un titre à délai fixe rejouerait
exactement le défaut corrigé ici, en entrant hors écran sur une fenêtre courte.

**Une ligne de cascade reste une unité de lecture.** À l'intérieur d'un
élément, c'est ce qui se lit d'un trait qui fait une ligne, et non chaque
élément du DOM : la liste des missions d'une expérience entre **en un bloc**,
jamais une mission à la fois, et un couple `dt` / `dd` de la liste des
compétences fait une ligne. Une expérience compte donc cinq lignes — intitulé,
période, résumé, missions, stack — et pas une par mission.

| Rubrique de page | Découpage | Lignes par rubrique de cascade |
|---|---|---|
| Parcours | le titre, puis une rubrique par expérience | 1, puis 5 |
| Compétences | une rubrique | le `h2`, puis chaque couple `dt` / `dd` |
| Formation | le titre, puis une rubrique par formation | 1, puis 2 à 4 |
| Me joindre | une rubrique | le `h2`, la disponibilité, puis chaque coordonnée |

« Compétences » (695 px) et « Me joindre » (214 px) restent d'un seul bloc :
elles tiennent dans la fenêtre, donc leur classement est juste.

`/a-propos` et `/projets` découpent ainsi de la même façon : un élément de
liste est une rubrique de cascade dans les deux cas.

**La liste des compétences groupe ses couples dans un `<div>`.** Un `dt` et son
`dd` sont deux éléments frères, et aucun ne contient l'autre : un couple ne peut
porter une ligne qu'à travers un élément qui l'enveloppe. HTML autorise
explicitement un `<div>` autour d'un groupe `dt` / `dd` dans un `<dl>`, et les
sélecteurs de la page visent des descendants, donc la mise en forme ne bouge
pas.

### La fiche d'expérience de `/a-propos`

Six niveaux de lecture, du plus fort au plus discret. Tranché le 12/11/2026
(issue #58), quand la fiche a reçu le produit servi, les outils et la méthode
du PDF du CV :

1. **le rôle et l'entreprise** — un `h3`, l'entreprise en texte atténué ;
2. **la période et le lieu** — petit corps, texte atténué ;
3. **le produit et son secteur** — même registre, collé dessous : il situe le
   poste autant que la date, et c'est pour cela qu'il prolonge cette ligne au
   lieu d'ouvrir le corps de la fiche. En texte, jamais en lien — le site d'un
   employeur n'est pas une référence du portfolio, et cinq liens sortants de
   plus dilueraient ceux qui comptent ;
4. **le résumé**, en corps de texte plein ;
5. **les missions**, en liste ;
6. **les technos, les outils et la méthode** — trois lignes d'un même
   registre, en pied de fiche, séparées du reste par un seul écart puis
   serrées entre elles. Trois écarts pleins les feraient lire comme trois
   rubriques, alors qu'elles répondent à la même question. La méthode est une
   phrase et non une énumération : l'italique la distingue des deux listes
   qu'elle suit, sans ajouter de couleur ni de graisse.

**Le CV sépare les technos des outils, et la page garde cette séparation** :
un recruteur technique cherche la techno, un recruteur RH reconnaît l'outil.
Les mélanger — « Suite Adobe » à côté de « Vue 3 » — annulait la distinction.

La méthode manque aux deux fiches les plus anciennes, qui n'en déclarent
aucune au CV. Rien ne s'invente pour remplir un champ ; la ligne disparaît.

## 8. Organisation du code

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
contact, abandonné depuis (issue
[#5](https://github.com/arnaudbregere/portfolio/issues/5)).

`Button` est né de nouveau le 09/11/2026, et cette fois de trois emplois réels
— « Menu », « Fermer » et la bascule de thème — qui recopiaient le même bloc de
style et avaient commencé à diverger. C'est la différence entre un composant
spéculatif et un composant factorisé.

Les composants nés depuis le sont chacun de la page ou du gabarit qui les
utilise, dans le même commit :

```
app/components/
├── atoms/Button.vue            bouton de libellé, taille unique
├── molecules/ThemeToggle.vue   bascule clair / sombre
└── organisms/
    ├── SiteHeader.vue          nom, rubriques, bascule, bouton de menu
    ├── NavOverlay.vue          menu plein écran
    └── SiteFooter.vue          navigation en clair
content/nav.ts                  rubriques et profils — source unique
```

Les noms sont plats : `nuxt.config.ts` pose `pathPrefix: false`. Le niveau
Atomic Design range le fichier, il ne préfixe pas son nom.

## 9. Périmètre de design

- **Le CV n'est qu'un document à télécharger.** La page `/cv` en HTML que
  `PRODUCT.md` spécifiait est hors périmètre depuis le 26/10/2026.
- Aucune capture de Figaro Classifieds ni du Groupe La Poste : elles sont
  propriétaires. C'est la contrainte qui a fait naître l'encre d'annotation.
- Une seule police d'affichage chargée.
- Lighthouse ≥ 95 sur mobile, RGAA 4.1 / WCAG 2.1 AA.
