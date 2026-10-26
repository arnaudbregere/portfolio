---
name: new-project
description: Ajoute un projet à la rubrique Projets du portfolio — fiche de contenu, visuels, test et vérifications. À utiliser à chaque nouveau projet à présenter.
---

# Ajouter un projet au portfolio

## 1. Rassembler la matière

Avant d'écrire la moindre ligne, réunir :

- le rôle tenu et la période ;
- le **problème** traité, en une phrase, du point de vue de l'utilisateur ou de
  l'entreprise ;
- la **solution** retenue et ce qui a été arbitré ;
- un **résultat mesurable** : score Lighthouse, temps de chargement, taux
  d'erreur, délai de livraison, nombre d'utilisateurs. Un projet sans résultat
  mesurable n'est pas prêt à être publié ;
- les liens publics (dépôt, production) ;
- les visuels, et le droit de les publier. Pas de capture d'une interface
  client sous accord de confidentialité.

## 2. Écrire le contenu

Ajouter une entrée typée dans `content/projects.ts`, conforme au type
`Project`. Règles de `.claude/rules/content.md` : aucune chaîne HTML, aucune
classe CSS, aucun style dans les données. Le texte alternatif de chaque image
est une propriété du contenu.

## 3. Visuels

Déposer les images dans `public/projets/<slug>/`. Les servir par `<NuxtImg>`
avec `width`, `height` et `loading` explicites. Viser moins de 200 Ko par
image après conversion.

## 4. Vérifier

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

- [ ] La fiche `/projets/<slug>` répond et affiche les six sections attendues.
- [ ] La carte apparaît dans la grille `/projets`.
- [ ] Un seul `h1` sur la fiche, hiérarchie de titres sans saut.
- [ ] Données structurées JSON-LD `CreativeWork` présentes.
- [ ] `title` et `description` propres à la fiche.
- [ ] Le test de rendu de la fiche passe.

Puis lancer l'agent `a11y-seo-auditor` sur la nouvelle page avant la PR.
