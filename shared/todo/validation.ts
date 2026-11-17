import {
  DEFAULT_PRIORITY,
  PRIORITIES,
  type Priority,
  type RefusalCode,
  type Result,
  type Todo,
  ok,
  refuse,
} from './types.ts'

/**
 * Les gardes du modèle, sans aucune dépendance.
 *
 * Elles sont écrites à la main plutôt que tirées d'un schéma : six champs,
 * trois règles, une quarantaine de lignes. Le principe II de la constitution
 * demande de vérifier qu'une dépendance est due avant de l'ajouter. Zod
 * reprendra l'avantage le jour où le modèle grossira ou qu'un schéma devra
 * être partagé avec un tiers — `specs/001-todo-list/research.md` D5.
 *
 * **Elles s'appliquent des deux côtés.** Le service les réapplique sur ce que
 * le client a déjà validé : FR-018, et la règle de
 * `.claude/rules/backend.md` — ne jamais faire confiance au client, même
 * quand le formulaire valide déjà côté navigateur.
 *
 * L'extension `.ts` de l'import n'est pas un oubli : Node 22 exécute ce
 * fichier par retrait des types, et exige alors l'extension réelle.
 */

/** Longueur maximale d'un titre, espaces de bord retirés. */
export const TITLE_MAX = 120

/**
 * Le titre, espaces de bord retirés.
 *
 * `trim` d'abord, mesure ensuite : un titre de cent trente espaces est vide,
 * pas trop long, et le visiteur doit lire « le titre est vide ». L'ordre
 * inverse donnerait le mauvais message pour la mauvaise raison.
 */
export const checkTitle = (value: unknown): Result<string> => {
  if (typeof value !== 'string') return refuse<string>('titre-vide')

  const trimmed = value.trim()

  if (trimmed.length === 0) return refuse<string>('titre-vide')
  if (trimmed.length > TITLE_MAX) return refuse<string>('titre-trop-long')

  return ok(trimmed)
}

/**
 * La priorité, ou le repli.
 *
 * `undefined` n'est pas une erreur — c'est une priorité non exprimée, et le
 * modèle en a une par défaut. `null`, un nombre ou une chaîne inconnue en
 * sont, parce qu'ils disent une intention que le modèle ne sait pas tenir.
 */
export const checkPriority = (value: unknown): Result<Priority> => {
  if (value === undefined) return ok(DEFAULT_PRIORITY)

  return PRIORITIES.includes(value as Priority)
    ? ok(value as Priority)
    : refuse<Priority>('priorite-inconnue')
}

/**
 * L'état fait ou non.
 *
 * **Ce n'est pas une garde**, et elle ne rend pas de refus : la liste des
 * codes est close, et aucun n'y désigne un `done` mal formé. Une valeur qui
 * n'est pas un booléen est traitée comme **absente** — le client n'a rien
 * demandé —, ce qui est le seul comportement que le modèle sait tenir sans
 * inventer un cinquième code.
 */
export const readDone = (value: unknown): boolean | undefined =>
  typeof value === 'boolean' ? value : undefined

/**
 * La tâche portant cet identifiant, ou le refus `tache-introuvable`.
 *
 * Le domaine ne lève pas sur un identifiant inconnu : une tâche supprimée
 * dans un autre onglet est un cas ordinaire, pas une panne.
 */
export const findTodo = (todos: readonly Todo[], id: unknown): Result<Todo> => {
  const found = typeof id === 'string' ? todos.find((todo) => todo.id === id) : undefined

  return found ? ok(found) : refuse<Todo>('tache-introuvable')
}

/**
 * Le message que l'interface affiche pour un refus.
 *
 * Il vit ici et non dans un gabarit : `.claude/rules/content.md` veut qu'un
 * texte destiné à l'écran soit une propriété nommée, jamais une valeur
 * improvisée dans un template. Le service, lui, ne sert que le code — un
 * corps d'erreur ne porte rien d'autre.
 */
export const refusalMessage: Record<RefusalCode, string> = {
  'titre-vide': 'Le titre est vide.',
  'titre-trop-long': `Le titre dépasse ${TITLE_MAX} caractères.`,
  'priorite-inconnue': 'Cette priorité n’existe pas.',
  'tache-introuvable': 'Cette tâche n’existe plus.',
}
