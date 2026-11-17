import { creerApp } from './app.ts'

/**
 * Le point d'entrée : `node src/server.ts`, sans étape de build. Node 22
 * retire les types à la volée — décision D2 de
 * `specs/001-todo-list/research.md`, vérifiée par exécution.
 *
 * Le port vient de l'environnement : un hébergeur l'impose, et le coder en dur
 * rendrait le service inlançable ailleurs qu'en développement.
 */
const port = Number(process.env.PORT ?? 4330)

creerApp().listen(port, () => {
  console.log(`[api] à l’écoute sur ${port}`)
})
