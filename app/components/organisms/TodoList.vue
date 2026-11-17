<script setup lang="ts">
import type { Todo, TodoFilter } from '~~/shared/todo/types'
import { priorityLabel } from '~~/shared/todo/domain'
import { TITLE_MAX } from '~~/shared/todo/validation'
import type { TodoStore } from '~/adapters/todo-store'
import { createBrowserStore } from '~/adapters/browser-store'
import { useTodos } from '~/composables/useTodos'

/**
 * Liste de tâches jouable. Le composant ne porte que le rendu, le clavier et
 * le focus : toute la logique vit dans `useTodos`, testé sans monter de
 * composant — même discipline que `Calculator`.
 *
 * ## La source est injectée, et créée au montage
 *
 * `store` est une prop pour que les tests passent un port simulé. Sans elle,
 * le composant crée l'adaptateur navigateur **dans `onMounted`** et non dans
 * `setup` : `window.localStorage` n'existe pas au rendu serveur, et la page
 * est prérendue comme les sept autres.
 *
 * Le document servi par le serveur porte donc une liste vide. Ce n'est pas
 * une divergence d'hydratation — rien n'y dépend d'un état que le serveur
 * ignore —, c'est une mise à jour réactive ordinaire après le montage.
 */
const props = defineProps<{ store?: TodoStore }>()

/**
 * Le stockage n'existe qu'au navigateur, et la page est prérendue : au
 * serveur, l'adaptateur reçoit `null` et sert les exemples en mémoire, sans
 * rien retenir. Le port ne change pas de forme pour autant — c'est tout
 * l'intérêt de l'avoir.
 */
const store = props.store ?? createBrowserStore(import.meta.client ? window.localStorage : null)

/**
 * Déstructuré, et non gardé en objet : un `ref()` posé autour du composable
 * déballerait les refs qu'il contient, et le gabarit lirait des chaînes là où
 * il attend des références. Mesuré le 17/11/2026, vingt erreurs de
 * `npm run typecheck` à la clé.
 */
const {
  todos: items,
  visible,
  remaining,
  filter,
  error,
  notice,
  undoable,
  load,
  add,
  toggle,
  remove: removeTodo,
  undo,
  reset,
  setFilter,
} = useTodos(store)

const draft = ref('')
const ready = ref(false)
const addField = useTemplateRef<HTMLInputElement>('addField')
const undoButton = useTemplateRef<HTMLButtonElement>('undoButton')

const filters: readonly { value: TodoFilter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'active', label: 'À faire' },
  { value: 'done', label: 'Faites' },
]

/**
 * Le chargement n'a lieu qu'au montage, donc le document servi par le serveur
 * porte le même état que la première image rendue par le navigateur : une
 * liste vide, et rien à réconcilier. C'est la règle de
 * `.claude/rules/frontend.md` — aucun texte rendu au serveur ne dérive d'un
 * état que le serveur n'a pas.
 */
onMounted(async () => {
  await load()
  ready.value = true
})

/** Ce que la source dit d'elle-même : rien, ou une phrase à afficher. */
const sourceNotice = computed(() => store.status().notice)

/**
 * Le message annoncé au lecteur d'écran — **et le refus n'y passe pas**.
 *
 * Premier jet : la région vivante portait aussi le message d'erreur, puisque
 * le focus ne bouge pas quand une saisie est refusée et qu'un
 * `aria-describedby` seul ne serait jamais relu. Le texte se retrouvait alors
 * **deux fois dans l'arbre d'accessibilité** — dans le paragraphe visible et
 * dans la région —, ce qu'un test de bout en bout a relevé en refusant de
 * choisir entre deux éléments portant la même phrase.
 *
 * Le refus est donc annoncé par le paragraphe lui-même, en `role="alert"` :
 * il est sa propre région vivante, assertive, annoncée à son apparition. Une
 * seule source pour un seul message.
 */
const announcement = computed(() => notice.value)

const submit = async () => {
  const added = await add(draft.value)

  if (added) draft.value = ''

  addField.value?.focus()
}

/**
 * Après une suppression, le focus se pose sur « Annuler ».
 *
 * C'est l'action suivante la plus probable, et c'est un élément vivant : la
 * ligne qui portait le focus vient de disparaître, et sans cette reprise le
 * focus retombe sur `<body>` (FR-024).
 */
const onRemove = async (todo: Todo) => {
  await removeTodo(todo)
  await nextTick()
  undoButton.value?.focus()
}

/** Après une annulation, le champ reprend la main : la liste est entière. */
const onUndo = async () => {
  await undo()
  await nextTick()
  addField.value?.focus()
}
</script>

<template>
  <div class="o-todo">
    <!-- Un vrai formulaire, pour que la touche Entrée valide. Rien n'est
         soumis : `form-action 'none'` de la politique de sécurité reste
         tenu. -->
    <form class="o-todo__add" @submit.prevent="submit">
      <div class="o-todo__field">
        <label class="o-todo__label" for="todo-title">Ajouter une tâche</label>
        <input
          id="todo-title"
          ref="addField"
          v-model="draft"
          class="o-todo__input"
          type="text"
          name="title"
          autocomplete="off"
          :maxlength="TITLE_MAX + 1"
          :aria-describedby="error ? 'todo-error' : undefined"
          :aria-invalid="error ? 'true' : undefined"
        >
      </div>

      <Button type="submit">Ajouter</Button>
    </form>

    <p v-if="error" id="todo-error" class="o-todo__error" role="alert">
      {{ error }}
    </p>

    <div class="o-todo__bar">
      <fieldset class="o-todo__filters">
        <legend class="visually-hidden">Filtrer les tâches</legend>

        <label v-for="option in filters" :key="option.value" class="o-todo__filter">
          <input
            :checked="filter === option.value"
            class="visually-hidden"
            type="radio"
            name="todo-filter"
            :value="option.value"
            @change="setFilter(option.value)"
          >
          <span class="o-todo__filter-label">{{ option.label }}</span>
        </label>
      </fieldset>

      <p class="o-todo__count">
        {{ items.length }}
        {{ items.length > 1 ? 'tâches' : 'tâche' }},
        {{ remaining }} à faire
      </p>
    </div>

    <ul v-if="visible.length" class="o-todo__list">
      <li v-for="todo in visible" :key="todo.id" class="o-todo__item">
        <!-- La case est un vrai `input` : un `div` cliquable coûterait
             l'état, le clavier et l'annonce. La cible de 44px est portée par
             le libellé, pas par le carré. -->
        <label class="o-todo__check">
          <input
            :checked="todo.done"
            type="checkbox"
            @change="toggle(todo)"
          >
          <span :class="['o-todo__title', todo.done && 'o-todo__title--done']">
            {{ todo.title }}
          </span>
        </label>

        <TagList class="o-todo__priority" :items="[priorityLabel[todo.priority]]" label="Priorité" />

        <button
          type="button"
          class="o-todo__remove"
          @click="onRemove(todo)"
        >
          <span class="visually-hidden">Supprimer « {{ todo.title }} »</span>
          <span aria-hidden="true">✕</span>
        </button>
      </li>
    </ul>

    <!-- Avant le montage, la liste n'est pas vide : elle n'est pas encore
         lue. Le document prérendu ne doit donc pas annoncer « plus rien à
         faire » — ce serait faux, et c'est ce qu'un moteur de recherche
         lirait. -->
    <p v-else-if="!ready" class="o-todo__empty">Chargement de la démo…</p>

    <!-- Deux absences, deux phrases : « rien pour ce filtre » n'est pas
         « rien du tout », et un visiteur qui a filtré doit savoir laquelle
         il regarde. -->
    <p v-else-if="items.length" class="o-todo__empty">
      Aucune tâche ne correspond à ce filtre.
    </p>

    <p v-else class="o-todo__empty">
      Plus rien à faire. Ajoutez une tâche ci-dessus.
    </p>

    <div class="o-todo__foot">
      <!-- Le rattrapage n'a pas de minuteur : il reste tant que le visiteur
           n'a rien fait d'autre. Un minuteur serait injoignable au clavier,
           et perdu pour un lecteur d'écran qui lit l'annonce. -->
      <p v-if="undoable" class="o-todo__undo">
        <span>{{ undoable.message }}</span>
        <button ref="undoButton" type="button" class="o-todo__undo-action" @click="onUndo">
          Annuler
        </button>
      </p>

      <button type="button" class="o-todo__reset" @click="reset()">
        Réinitialiser
      </button>
    </div>

    <p v-if="sourceNotice" class="o-todo__source-notice">{{ sourceNotice }}</p>

    <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>
  </div>
</template>

<style scoped lang="scss">
.o-todo {
  max-width: 34rem;
  border: var(--rule-strong);
}

.o-todo__add {
  display: flex;
  gap: var(--space-2xs);
  align-items: flex-end;
  padding: var(--space-s);
  border-bottom: var(--rule-strong);
}

.o-todo__field {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-3xs);
}

.o-todo__label {
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

/* Le champ est un rectangle à filet, comme tout contrôle du site : même
   hauteur et même filet que `Button`. `DESIGN.md` § 5 réserve l'arrondi à la
   taxonomie. */
.o-todo__input {
  min-height: var(--control-min-height);
  padding: var(--space-2xs) var(--space-xs);
  border: var(--rule-strong);
  border-radius: 0;
  background-color: transparent;
  color: var(--color-fg);
  font-family: inherit;
  font-size: var(--step-0);
}

.o-todo__error {
  margin: 0;
  padding: var(--space-2xs) var(--space-s);
  border-bottom: var(--rule);
  color: var(--color-ink);
  font-size: var(--step--1);
}

.o-todo__bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs) var(--space-s);
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2xs) var(--space-s);
  border-bottom: var(--rule);
}

/* `fieldset` remis à plat : il n'apporte ici que la sémantique de groupe. */
.o-todo__filters {
  display: flex;
  gap: var(--space-xs);
  margin: 0;
  padding: 0;
  border: 0;
}

/* Les filtres sont du texte et non des boîtes : ils trient, ils ne changent
   pas le système. La barre de l'en-tête emploie déjà ce motif pour la
   rubrique courante. `DESIGN.md` § 5. */
.o-todo__filter {
  display: inline-flex;
  align-items: center;
  min-height: var(--control-min-height);
  cursor: pointer;
}

.o-todo__filter-label {
  color: var(--color-fg-muted);
  font-family: var(--font-display);
  font-size: var(--size-label);
  font-weight: var(--label-weight);
  font-stretch: var(--label-stretch);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

/* L'actif passe à l'encre. L'information ne repose pas sur la seule couleur :
   l'état coché du bouton radio la porte déjà pour l'arbre d'accessibilité. */
.o-todo__filter input:checked + .o-todo__filter-label {
  color: var(--color-ink);
}

/* L'anneau de focus suit le libellé, puisque la commande est masquée. */
.o-todo__filter input:focus-visible + .o-todo__filter-label {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.o-todo__count {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: var(--step--1);
  font-variant-numeric: tabular-nums;
}

.o-todo__item {
  display: flex;
  gap: var(--space-2xs) var(--space-s);
  align-items: center;
  padding: var(--space-2xs) var(--space-s);
}

.o-todo__item + .o-todo__item {
  border-top: var(--rule);
}

/* Le libellé porte la cible tactile : 44px exigés par RGAA 4.1, qu'un carré
   de case à cocher n'atteint jamais seul. */
.o-todo__check {
  display: flex;
  flex: 1;
  gap: var(--space-2xs);
  align-items: center;
  min-height: var(--control-min-height);
  cursor: pointer;
}

/* Une tâche faite se lit sans couleur : la case cochée porte l'état, le trait
   le double. WCAG 1.4.1. */
.o-todo__title--done {
  color: var(--color-fg-muted);
  text-decoration: line-through;
}

.o-todo__remove {
  min-width: var(--control-min-height);
  min-height: var(--control-min-height);
  border: 0;
  background-color: transparent;
  color: var(--color-fg-muted);
  font-family: inherit;
  font-size: var(--step-0);
  cursor: pointer;
}

.o-todo__remove:hover {
  color: var(--color-ink);
}

.o-todo__empty {
  margin: 0;
  padding: var(--space-m) var(--space-s);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

.o-todo__foot {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs) var(--space-s);
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2xs) var(--space-s);
  border-top: var(--rule);
}

.o-todo__undo {
  display: flex;
  gap: var(--space-2xs);
  align-items: center;
  margin: 0;
  font-size: var(--step--1);
}

.o-todo__undo-action,
.o-todo__reset {
  min-height: var(--control-min-height);
  padding: 0;
  border: 0;
  background-color: transparent;
  color: var(--color-ink);
  font-family: inherit;
  font-size: var(--step--1);
  text-decoration: underline;
  cursor: pointer;
}

.o-todo__reset {
  color: var(--color-fg-muted);
  margin-inline-start: auto;
}

.o-todo__source-notice {
  margin: 0;
  padding: var(--space-2xs) var(--space-s);
  border-top: var(--rule);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}
</style>
