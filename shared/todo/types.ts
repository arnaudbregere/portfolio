/**
 * Le modèle de la liste de tâches, déclaré **une seule fois**.
 *
 * `app/` le lit par l'alias `~~`, le paquet `api/` par un chemin relatif.
 * Aucun `package.json` ne cite l'autre : ce n'est pas une dépendance croisée
 * au sens de `.claude/rules/e2e.md`, c'est un fichier lu par chemin.
 * `specs/001-todo-list/research.md` D1 porte le raisonnement et les quatre
 * alternatives écartées — dont la duplication assumée, qui vaut vingt lignes
 * au départ et deux comportements au premier correctif.
 */

/**
 * Les trois priorités, en **union de chaînes et non en `enum`**.
 *
 * Node 22 exécute le TypeScript par retrait des types, sans étape de build :
 * un `enum` produit du code, donc il échoue en
 * `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`. `erasableSyntaxOnly` dans le
 * `tsconfig` d'`api/` fait tomber l'erreur au `typecheck` plutôt qu'au
 * premier lancement du serveur.
 */
export type Priority = 'low' | 'medium' | 'high'

/** Les mêmes valeurs, parcourables — la validation en a besoin à l'exécution. */
export const PRIORITIES = ['low', 'medium', 'high'] as const

/** Priorité d'une tâche qui n'en demande pas. */
export const DEFAULT_PRIORITY: Priority = 'medium'

/**
 * Une tâche.
 *
 * Pas de `description` : le champ existait dans l'ancien portfolio et était
 * vide dans toutes les tâches de `todos.json`. Il reviendra le jour où une
 * page l'affiche. Pas d'échéance, pas de catégorie, pas de propriétaire :
 * anti-objectifs de `DESIGN.md` § 5.
 */
export type Todo = {
  /** Opaque, posé par le domaine. Stable pour la vie de la tâche. */
  id: string
  /** 1 à 120 caractères, espaces de bord retirés. */
  title: string
  done: boolean
  priority: Priority
  /** ISO 8601, posé par le domaine. Immuable. */
  createdAt: string
  /** ISO 8601. Égal à `createdAt` à la création. */
  updatedAt: string
}

/** Les trois vues de la liste. L'interface filtre, le domaine sait comment. */
export type TodoFilter = 'all' | 'active' | 'done'

/**
 * Les refus que le domaine sait prononcer. Liste close : un cinquième code
 * demande une règle, et une règle demande un test.
 */
export type RefusalCode =
  | 'titre-vide'
  | 'titre-trop-long'
  | 'priorite-inconnue'
  | 'tache-introuvable'

/**
 * Le résultat d'une opération qui peut refuser.
 *
 * **Un refus est une valeur, jamais une exception.** Le service le traduit en
 * `400`, l'interface en message près du champ, et les deux lisent le même
 * code. Une exception, elle, reste réservée à ce qui ne vient pas du
 * domaine : un réseau coupé, un stockage qui refuse de répondre.
 */
export type Result<T> = { ok: true; value: T } | { ok: false; refusal: RefusalCode }

export const ok = <T>(value: T): Result<T> => ({ ok: true, value })

export const refuse = <T>(refusal: RefusalCode): Result<T> => ({ ok: false, refusal })
