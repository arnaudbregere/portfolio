<script setup lang="ts">
import type { Priority, Todo, TodoFilter } from '~~/shared/todo/types'
import { DEFAULT_PRIORITY, PRIORITIES } from '~~/shared/todo/types'
import { priorityLabel } from '~~/shared/todo/domain'
import { TITLE_MAX } from '~~/shared/todo/validation'
import type { TodoStore } from '~/adapters/todo-store'
import { createBrowserStore } from '~/adapters/browser-store'
import { createHttpStore } from '~/adapters/http'
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
const stockage = () => (import.meta.client ? window.localStorage : null)

const navigateur = props.store ?? createBrowserStore(stockage())

/**
 * La seconde source, créée même quand le service dort : son existence ne coûte
 * rien, et `disponible()` tranchera. L'origine vient de `runtimeConfig`,
 * jamais d'une URL écrite en dur — le développement, une préversion et la
 * production n'ont pas la même.
 */
const { apiOrigin } = useRuntimeConfig().public

/* La prop n'injecte que la source **navigateur** : une seule source simulée
   des deux côtés ne prouverait rien, et un test qui croirait vérifier la
   bascule la raterait. L'adaptateur HTTP est donc toujours le vrai, et c'est
   sa sonde qui tranche — elle rend `false` sans lever quand rien n'écoute. */
const distante = apiOrigin
  ? createHttpStore({ origin: apiOrigin, storage: stockage() })
  : null

/** La source du moment. Le port est le même, c'est tout l'objet de la démo. */
type Source = 'navigateur' | 'api'

const source = ref<Source>('navigateur')
const apiJoignable = ref(false)
const apiSondee = ref(false)

/* Nommée `courante` et non `store` : `store` est déjà le nom de la prop, et
   Vue refuse qu'une variable du `setup` porte le nom d'une prop. */
const courante = () => (source.value === 'api' && distante ? distante : navigateur)

/**
 * Déstructuré, et non gardé en objet : un `ref()` posé autour du composable
 * déballerait les refs qu'il contient, et le gabarit lirait des chaînes là où
 * il attend des références. Mesuré le 17/11/2026, vingt erreurs de
 * `npm run typecheck` à la clé.
 */
const sources: readonly { value: Source; label: string }[] = [
  { value: 'navigateur', label: 'Navigateur' },
  { value: 'api', label: 'API' },
]

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
  patch,
  toggle,
  remove: removeTodo,
  undo,
  reset,
  setFilter,
} = useTodos(courante)

const draft = ref('')
const ready = ref(false)
const root = useTemplateRef<HTMLElement>('root')
const addField = useTemplateRef<HTMLInputElement>('addField')
const undoButton = useTemplateRef<HTMLButtonElement>('undoButton')

/**
 * La priorité du formulaire d'ajout. Elle **ne retombe pas** au défaut après
 * un ajout : on saisit souvent plusieurs tâches de même rang à la suite, et
 * remettre « moyenne » à chaque fois ferait recommencer le choix.
 */
const addPriority = ref<Priority>(DEFAULT_PRIORITY)

/**
 * Le mode d'édition, et il n'y en a qu'un : `null`, ou l'identifiant de la
 * seule ligne ouverte. Deux lignes ouvertes poseraient deux fois la question
 * « où revient le focus ? », et `DESIGN.md` § 5 n'en veut qu'une.
 */
const editing = ref<string | null>(null)
const editTitle = ref('')
const editPriority = ref<Priority>(DEFAULT_PRIORITY)

const priorities = PRIORITIES.map((value) => ({ value, label: priorityLabel[value] }))

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

  /* Sans origine configurée, rien à sonder : pas de `fetch`, donc pas
     d'erreur CORS dans la console du visiteur. Avec origine, la sonde ne
     bloque pas l'arrivée — l'instance gratuite met parfois trente secondes à
     se réveiller — et `disponible()` ne lève jamais (FR-016). */
  apiJoignable.value = distante ? await distante.available() : false
  apiSondee.value = true
})

/** Ce que la source dit d'elle-même : rien, ou une phrase à afficher. */
const sourceNotice = computed(() => courante().status().notice)

/**
 * Pourquoi l'API est hors d'atteinte, en clair — jamais de repli silencieux.
 * Une démo qui prétend montrer deux adaptateurs tout en servant toujours le
 * même mentirait sur la seule chose qu'elle est là pour prouver.
 */
/**
 * Le sélecteur ne paraît **que s'il y a un choix à faire**.
 *
 * Décision d'Arnaud du 17/11/2026, prise sur capture : service éteint, un
 * visiteur arrivait sur une option grisée et un message d'échec posés avant
 * la démo, et lisait « quelque chose est cassé ». L'instance gratuite dort,
 * donc c'était l'état par défaut.
 *
 * Ce n'est pas un repli silencieux, et la décision du matin tient : on ne
 * bascule jamais de source en douce. On cesse seulement de proposer une porte
 * fermée. Le jour où le service est déployé, le bloc revient de lui-même —
 * aucune ligne à changer.
 */
const sourceChoisissable = computed(() => apiSondee.value && apiJoignable.value)

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
  const added = await add(draft.value, addPriority.value)

  if (added) draft.value = ''

  addField.value?.focus()
}

/**
 * Changer de filtre change le contenu de la liste, sans que rien ne le dise.
 *
 * L'état coché du bouton radio est annoncé, le **résultat** ne l'était pas :
 * un lecteur d'écran entendait « Faites, sélectionné » sans savoir combien de
 * tâches restaient à l'écran (WCAG 4.1.3). Relevé par l'audit du 17/11/2026.
 */
const onFilter = async (choix: TodoFilter) => {
  setFilter(choix)

  await nextTick()

  const compte = visible.value.length

  notice.value = `${filters.find(({ value }) => value === choix)!.label} : ${compte} ${
    compte > 1 ? 'tâches' : 'tâche'
  }.`
}

/**
 * Cocher une tâche peut la faire **sortir de la vue filtrée**.
 *
 * La ligne est alors démontée sous le doigt, et le focus retombe sur
 * `<body>` : l'anneau disparaît et un lecteur d'écran perd sa place
 * (WCAG 2.4.3). C'est le même défaut que la suppression traite déjà, sur un
 * geste plus courant — relevé par l'audit du 17/11/2026, qu'aucun test ne
 * voyait.
 *
 * Le focus va à la ligne qui prend la place, sinon à la précédente, sinon au
 * champ d'ajout : toujours un élément vivant.
 */
const onToggle = async (todo: Todo) => {
  const rang = visible.value.findIndex(({ id }) => id === todo.id)

  await toggle(todo)
  await nextTick()

  if (visible.value.some(({ id }) => id === todo.id)) return

  const voisine = visible.value[rang] ?? visible.value[rang - 1]

  if (!voisine) return addField.value?.focus()

  root.value?.querySelector<HTMLInputElement>(`[data-case="${voisine.id}"]`)?.focus()
}

/**
 * Après une suppression, le focus se pose sur « Annuler ».
 *
 * C'est l'action suivante la plus probable, et c'est un élément vivant : la
 * ligne qui portait le focus vient de disparaître, et sans cette reprise le
 * focus retombe sur `<body>` (FR-024).
 */
const onRemove = async (todo: Todo) => {
  /* Supprimer la ligne ouverte en édition laisserait un mode sans ligne. */
  editing.value = null

  await removeTodo(todo)
  await nextTick()
  undoButton.value?.focus()
}

/**
 * Changer de source relit la liste, et rien d'autre ne bouge : ni le filtre,
 * ni le focus, ni le composable. C'est la démonstration elle-même — une
 * logique, deux adaptateurs.
 */
const changerSource = async (choix: Source) => {
  if (choix === source.value) return

  /* Un mode d'édition ouvert porte les valeurs d'une tâche de l'autre source :
     il se ferme sans enregistrer. */
  editing.value = null
  error.value = ''
  source.value = choix

  await load()

  notice.value = choix === 'api'
    ? 'Source : l’API. Les tâches viennent du service.'
    : 'Source : le navigateur. Les tâches restent sur cet appareil.'
}

/** Après une annulation, le champ reprend la main : la liste est entière. */
const onUndo = async () => {
  await undo()
  await nextTick()
  addField.value?.focus()
}

/** Les exemples reviennent, donc les identifiants changent : le mode se ferme. */
const onReset = async () => {
  editing.value = null

  await reset()
}

/**
 * Le focus revient sur le bouton qui a ouvert le mode — jamais sur `<body>`.
 *
 * Le bouton est retrouvé par son `data-edit` et non gardé dans une référence :
 * la ligne a été démontée puis remontée entre-temps, et une référence prise
 * avant l'ouverture désignerait un élément qui n'est plus dans le document.
 */
const focusEditButton = (id: string) => {
  root.value?.querySelector<HTMLButtonElement>(`[data-edit="${id}"]`)?.focus()
}

/**
 * Le champ du mode d'édition, retrouvé dans le document plutôt que gardé dans
 * une référence de gabarit : **un `ref` posé dans un `v-for` rend un tableau**,
 * même quand une seule ligne le porte — `editField.value.focus` était alors
 * `undefined`, relevé le 17/11/2026. Il n'y a qu'un mode ouvert à la fois,
 * donc le sélecteur ne peut en désigner qu'un.
 */
const focusEditField = () => {
  root.value?.querySelector<HTMLInputElement>('[data-edit-field]')?.focus()
}

const openEdit = async (todo: Todo) => {
  editing.value = todo.id
  editTitle.value = todo.title
  editPriority.value = todo.priority

  await nextTick()
  focusEditField()
}

const cancelEdit = async () => {
  const id = editing.value

  if (!id) return

  /* Le refus portait sur le champ d'édition qui disparaît : le laisser
     afficherait un message sans objet, et poserait `aria-invalid` sur le
     champ d'ajout, vide et jamais soumis. Relevé par l'audit du
     17/11/2026. */
  error.value = ''
  editing.value = null

  await nextTick()
  focusEditButton(id)
}

/**
 * Un refus **laisse le mode ouvert** : le titre fautif est encore à l'écran,
 * le focus retourne dessus, et le visiteur corrige. Fermer la ligne jetterait
 * sa saisie pour lui annoncer qu'elle était mauvaise.
 */
const saveEdit = async (todo: Todo) => {
  const saved = await patch(todo.id, { title: editTitle.value, priority: editPriority.value })

  if (!saved) {
    focusEditField()

    return
  }

  editing.value = null

  await nextTick()
  focusEditButton(todo.id)
}
</script>

<template>
  <div ref="root" class="o-todo">
    <!-- Le sélecteur de source ouvre le bloc : il commande tout ce qui suit,
         et placé en dessous il se lirait après coup. `DESIGN.md` § 5.

         Deux niveaux visuels, et c'est voulu : la source est un contrôle —
         rectangles à filet —, les filtres sont un tri — du texte. Six
         rectangles identiques ne diraient pas lequel change le système. -->
    <fieldset v-if="sourceChoisissable" class="o-todo__sources">
      <legend class="o-todo__sources-legend">Source des données</legend>

      <label
        v-for="option in sources"
        :key="option.value"
        class="o-todo__source"
      >
        <input
          :checked="source === option.value"
          class="visually-hidden"
          type="radio"
          name="todo-source"
          :value="option.value"
          @change="changerSource(option.value)"
        >
        <span class="o-todo__source-label">{{ option.label }}</span>
      </label>
    </fieldset>

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
          :aria-describedby="error && !editing ? 'todo-error' : undefined"
          :aria-invalid="error && !editing ? 'true' : undefined"
        >
      </div>

      <!-- La priorité se choisit à la création, et pas seulement en édition :
           sans ce champ, toute tâche naît « moyenne » et il faut rouvrir la
           ligne pour la corriger. `DESIGN.md` § 5, retours du 17/11/2026. -->
      <div class="o-todo__field o-todo__field--priority">
        <label class="o-todo__label" for="todo-priority">Priorité</label>

        <span class="o-todo__select">
          <select id="todo-priority" v-model="addPriority" class="o-todo__select-control">
            <option v-for="option in priorities" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <Icon class="o-todo__select-chevron" name="chevron-down" />
        </span>
      </div>

      <Button type="submit">Ajouter</Button>
    </form>

    <!-- Le refus paraît **là où est le champ fautif**. Pour une édition
         ouverte sur une ligne basse, un message en tête de bloc tombe hors du
         champ de vision alors que le focus revient dans la ligne. Un seul
         paragraphe existe à la fois : `role="alert"` reste unique, et l'`id`
         que les champs désignent aussi. Audit du 17/11/2026. -->
    <p v-if="error && !editing" id="todo-error" class="o-todo__error" role="alert">
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
            @change="onFilter(option.value)"
          >
          <span class="o-todo__filter-label">{{ option.label }}</span>
        </label>
      </fieldset>

      <!-- Avant le montage, la liste n'est pas vide : elle n'est pas encore
           lue. Un « 0 tâche, 0 à faire » prérendu serait faux, et c'est ce
           qu'un moteur de recherche indexerait. Audit du 17/11/2026. -->
      <p v-if="ready" class="o-todo__count">
        {{ items.length }}
        {{ items.length > 1 ? 'tâches' : 'tâche' }},
        {{ remaining }} à faire
      </p>
    </div>

    <ul v-if="visible.length" class="o-todo__list">
      <li v-for="todo in visible" :key="todo.id" class="o-todo__item">
        <!-- Un seul mode d'édition à la fois, et il porte les deux champs :
             le titre et la priorité. `Entrée` enregistre — c'est un vrai
             formulaire —, `Échap` annule. `DESIGN.md` § 5. -->
        <form
          v-if="editing === todo.id"
          class="o-todo__edit"
          @submit.prevent="saveEdit(todo)"
          @keydown.esc="cancelEdit"
        >
          <div class="o-todo__field">
            <label class="o-todo__label" :for="`todo-edit-${todo.id}`">Titre</label>
            <input
              :id="`todo-edit-${todo.id}`"
              v-model="editTitle"
              data-edit-field
              class="o-todo__input"
              type="text"
              autocomplete="off"
              :maxlength="TITLE_MAX + 1"
              :aria-describedby="error ? 'todo-error' : undefined"
              :aria-invalid="error ? 'true' : undefined"
            >
          </div>

          <div class="o-todo__field o-todo__field--priority">
            <label class="o-todo__label" :for="`todo-edit-priority-${todo.id}`">Priorité</label>

            <span class="o-todo__select">
              <select
                :id="`todo-edit-priority-${todo.id}`"
                v-model="editPriority"
                class="o-todo__select-control"
              >
                <option v-for="option in priorities" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>

              <Icon class="o-todo__select-chevron" name="chevron-down" />
            </span>
          </div>

          <p v-if="error" id="todo-error" class="o-todo__error o-todo__error--inline" role="alert">
            {{ error }}
          </p>

          <Button type="submit">Enregistrer</Button>

          <!-- Le nom accessible dit ce qui est annulé : « Annuler » seul
               existe déjà sur le rattrapage de suppression, et deux boutons
               du même nom dans la même page sont deux boutons qu'un lecteur
               d'écran ne distingue pas. -->
          <button type="button" class="o-todo__cancel" @click="cancelEdit">
            Annuler<span class="visually-hidden"> la modification</span>
          </button>
        </form>

        <template v-else>
          <!-- La case est un vrai `input` : un `div` cliquable coûterait
               l'état, le clavier et l'annonce. La cible de 44px est portée par
               le libellé, pas par le carré. -->
          <label class="o-todo__check">
            <!-- La priorité décrit la tâche : sans ce rattachement, elle
                 n'est atteignable qu'en mode lecture, au prix d'un « liste,
                 1 élément » par ligne. La forme de l'étiquette ne bouge pas,
                 `DESIGN.md` § 5 l'a arbitrée. -->
            <input
              :checked="todo.done"
              :data-case="todo.id"
              :aria-describedby="`todo-priority-${todo.id}`"
              type="checkbox"
              @change="onToggle(todo)"
            >
            <span :class="['o-todo__title', todo.done && 'o-todo__title--done']">
              {{ todo.title }}
            </span>
          </label>

          <!-- Les trois priorités portent trois encres **déjà** dans la
               palette, posées par `--tag-ink`. Le mot reste écrit : la couleur
               le double, elle ne le remplace pas (WCAG 1.4.1). -->
          <TagList
            :id="`todo-priority-${todo.id}`"
            :class="['o-todo__priority', `o-todo__priority--${todo.priority}`]"
            :items="[priorityLabel[todo.priority]]"
            label="Priorité"
          />

          <button
            type="button"
            class="o-todo__action"
            :data-edit="todo.id"
            @click="openEdit(todo)"
          >
            <span class="visually-hidden">Modifier « {{ todo.title }} »</span>
            <span aria-hidden="true">✎</span>
          </button>

          <button
            type="button"
            class="o-todo__action"
            @click="onRemove(todo)"
          >
            <span class="visually-hidden">Supprimer « {{ todo.title }} »</span>
            <span aria-hidden="true">✕</span>
          </button>
        </template>
      </li>
    </ul>

    <!-- Avant le montage, la liste n'est pas vide : elle n'est pas encore
         lue. Le document prérendu ne doit donc pas annoncer « plus rien à
         faire » — ce serait faux, et c'est ce qu'un moteur de recherche
         lirait. -->
    <p v-else-if="!ready" class="o-todo__empty">
      Chargement de la démo…
      <noscript>
        Cette démo a besoin de JavaScript pour s’exécuter. Le reste de la fiche
        — le problème, la solution et le résultat — se lit sans lui.
      </noscript>
    </p>

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

      <!-- Le nom accessible dit ce qui est remis à zéro : « Réinitialiser »
           seul laisse croire à un filtre. L'action est destructive et sans
           rattrapage — audit du 17/11/2026. -->
      <button type="button" class="o-todo__reset" @click="onReset">
        Réinitialiser<span class="visually-hidden"> la démo, et perdre les tâches saisies</span>
      </button>
    </div>

    <p v-if="sourceNotice" class="o-todo__source-notice">{{ sourceNotice }}</p>

    <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/breakpoints' as bp;

.o-todo {
  border: var(--rule-strong);
}

/* Le bloc prend **toute** la largeur du gabarit à partir de `m`. Une ligne de
   tâche n'est pas de la prose : la mesure de 68 ch la tasserait, et le
   plafond de 50 rem essayé plus tôt le même jour a été écarté par Arnaud.
   Même motif que la pellicule de captures — `100cqi` mesure le gabarit
   (`.o-project` est le conteneur de requête) là où `100vw` compterait la
   barre de défilement. `DESIGN.md` § 5, retours du 17/11/2026. */
.o-todo {
  @include bp.respond-up(m) {
    width: 100cqi;
  }
}

/* La source est un contrôle : rectangles à filet, comme `Button`. Les filtres,
   eux, restent du texte — `DESIGN.md` § 5. */
.o-todo__sources {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs) var(--space-s);
  align-items: center;
  margin: 0;
  padding: var(--space-2xs) var(--space-s);
  border: 0;
  border-bottom: var(--rule-strong);
}

.o-todo__sources-legend {
  padding: 0;
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

.o-todo__source {
  display: inline-flex;
  align-items: center;
  min-height: var(--control-min-height);
  cursor: pointer;
}

.o-todo__source-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--control-min-width);
  min-height: var(--control-min-height);
  padding: 0 var(--space-xs);
  border: var(--rule-strong);
  color: var(--color-fg);
  font-family: var(--font-display);
  font-size: var(--size-label);
  font-weight: var(--label-weight);
  font-stretch: var(--label-stretch);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

/* L'actif passe à l'encre, fond compris : c'est le seul contrôle du bloc qui
   change le système, et il doit se voir comme tel. */
.o-todo__source input:checked + .o-todo__source-label {
  border-color: var(--color-ink);
  background-color: var(--color-ink);
  color: var(--color-ink-fg);
}

.o-todo__source input:focus-visible + .o-todo__source-label {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.o-todo__add {
  display: flex;
  flex-wrap: wrap;
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

/* Le champ de priorité ne s'étire pas : c'est le titre qui prend la place
   restante, dans le formulaire d'ajout comme dans le mode d'édition. */
.o-todo__field--priority {
  flex: 0 0 auto;
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

/* Dans la ligne ouverte, le refus prend toute la largeur sous les deux champs
   plutôt que de les pousser : il n'a ni filet ni gouttière à reprendre, le
   formulaire les porte déjà. */
.o-todo__error--inline {
  flex-basis: 100%;
  padding: 0;
  border-bottom: 0;
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

/* **La case est redessinée**, comme `DESIGN.md` § 5 l'avait décidé — et comme
   le code ne le faisait pas jusqu'au 17/11/2026, relevé par l'audit : elle
   était celle du système, simplement teintée par `accent-color`. Un filet et
   un carré de 20 px, donc la même famille que les autres contrôles, dans les
   deux thèmes et quel que soit le navigateur.

   La coche est tracée en CSS et non en image : deux traits, un pivot, aucune
   ressource à charger. `forced-colors` rend la main au système — un thème à
   contraste forcé sait mieux que nous. */
.o-todo__check input[type='checkbox'] {
  flex: 0 0 auto;
  inline-size: 1.25rem;
  block-size: 1.25rem;
  margin: 0;
  border: var(--rule-strong);
  background-color: transparent;
  appearance: none;
  cursor: pointer;
}

.o-todo__check input[type='checkbox']:checked {
  border-color: var(--color-ink);
  background-color: var(--color-ink);
}

.o-todo__check input[type='checkbox']:checked::after {
  display: block;
  inline-size: 0.3125rem;
  block-size: 0.625rem;
  margin: 0.125rem auto 0;
  border: 2px solid var(--color-ink-fg);
  border-block-start: 0;
  border-inline-start: 0;
  content: '';
  rotate: 45deg;
}

.o-todo__check input[type='checkbox']:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

@media (forced-colors: active) {
  .o-todo__check input[type='checkbox'] {
    appearance: auto;
  }
}

/* Une tâche faite se lit sans couleur : la case cochée porte l'état, le trait
   le double. WCAG 1.4.1. */
.o-todo__title--done {
  color: var(--color-fg-muted);
  text-decoration: line-through;
}

/* Modifier et supprimer partagent la forme : un pictogramme sans filet, à la
   cible de 44 px, dont le nom accessible est un texte masqué visuellement —
   le signe est `aria-hidden` et ne porte jamais le sens. */
.o-todo__action {
  min-width: var(--control-min-height);
  min-height: var(--control-min-height);
  border: 0;
  background-color: transparent;
  color: var(--color-fg-muted);
  font-family: inherit;
  font-size: var(--step-0);
  cursor: pointer;
}

.o-todo__action:hover {
  color: var(--color-ink);
}

/* Rouge, orange, vert — les trois tokens de priorité du § 2, et le seul
   endroit du site qui les emploie. Le mot reste écrit dans l'étiquette : la
   couleur le double, elle ne le porte jamais seule (WCAG 1.4.1), ce qui vaut
   aussi pour les huit pour cent d'hommes qui confondent le rouge et le vert.
   Les six ratios sont verrouillés par `tests/unit/contrast.spec.ts`. */
.o-todo__priority--high {
  --tag-ink: var(--color-priority-high);
}

.o-todo__priority--medium {
  --tag-ink: var(--color-priority-medium);
}

.o-todo__priority--low {
  --tag-ink: var(--color-priority-low);
}

/* Le mode d'édition occupe la ligne entière : il remplace le contenu de la
   ligne, il ne s'ajoute pas en dessous — sinon la liste se décale sous le
   doigt à chaque ouverture. */
.o-todo__edit {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: var(--space-2xs);
  align-items: flex-end;
  padding-block: var(--space-2xs);
}

.o-todo__cancel {
  min-height: var(--control-min-height);
  padding: 0 var(--space-2xs);
  border: 0;
  background-color: transparent;
  color: var(--color-fg-muted);
  font-family: inherit;
  font-size: var(--step--1);
  text-decoration: underline;
  cursor: pointer;
}

/* Le premier `<select>` du site. Mêmes filet, hauteur et tokens de texte que
   `Button` : c'est un contrôle, donc un rectangle à filet — l'arrondi reste
   réservé à la taxonomie. `appearance: none` retire la flèche du système, qui
   ne suit ni la police ni le thème ; le chevron de l'atome `Icon` la
   remplace. `DESIGN.md` § 5. */
.o-todo__select {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.o-todo__select-control {
  min-height: var(--control-min-height);
  padding: var(--space-2xs) calc(var(--space-s) + var(--space-xs)) var(--space-2xs) var(--space-xs);
  border: var(--rule-strong);
  border-radius: 0;
  background-color: transparent;
  color: var(--color-fg);
  font-family: inherit;
  font-size: var(--step-0);
  appearance: none;
  cursor: pointer;
}

/* Le chevron ne reçoit aucun clic : c'est le `<select>` natif qui ouvre sa
   liste, et lui seul. */
.o-todo__select-chevron {
  position: absolute;
  right: var(--space-2xs);
  color: var(--color-fg-muted);
  pointer-events: none;
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
