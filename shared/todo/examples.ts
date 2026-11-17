import type { Todo } from './types.ts'

/**
 * Les trois tâches d'arrivée de la démo.
 *
 * Décision d'Arnaud du 17/11/2026, prise pendant `/impeccable shape` : un
 * visiteur qui arrive sur une liste vide repart. Trois tâches lui montrent la
 * forme d'une ligne, les trois priorités et une tâche déjà faite sans qu'il
 * ait rien tapé. Le bouton « Réinitialiser » y ramène.
 *
 * Elles vivent ici et non dans un gabarit : `.claude/rules/content.md` veut
 * qu'un texte destiné à l'écran soit une propriété nommée. Le service les sème
 * aussi, pour qu'une liste neuve soit la même des deux côtés (FR-020).
 *
 * Les horodatages sont **fixes**. Une date calculée au chargement ferait du
 * contenu de la démo une variable du moment, donc un test instable et un
 * rendu serveur qui diverge du rendu client.
 */
export const exampleTodos: readonly Todo[] = [
  {
    id: 'exemple-1',
    title: 'Relire le cadrage du projet',
    done: false,
    priority: 'high',
    createdAt: '2026-11-17T09:00:00.000Z',
    updatedAt: '2026-11-17T09:00:00.000Z',
  },
  {
    id: 'exemple-2',
    title: 'Préparer l’entretien',
    done: false,
    priority: 'medium',
    createdAt: '2026-11-17T08:30:00.000Z',
    updatedAt: '2026-11-17T08:30:00.000Z',
  },
  {
    id: 'exemple-3',
    title: 'Mettre à jour le CV',
    done: true,
    priority: 'low',
    createdAt: '2026-11-17T08:00:00.000Z',
    updatedAt: '2026-11-17T08:15:00.000Z',
  },
] as const
