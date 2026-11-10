import { buildHealth } from '../utils/health'

/**
 * `GET /api/health` — ce qui est en ligne, et depuis quel commit.
 *
 * Transport seulement : la construction du rapport vit dans
 * `server/utils/health.ts`, et c'est elle qui est testée.
 *
 * Les valeurs viennent de `runtimeConfig`, renseigné au build par les
 * variables de l'hébergeur. Elles décrivent donc le build qui répond, pas la
 * machine qui l'exécute.
 */
export default defineEventHandler((event) => {
  const { build } = useRuntimeConfig(event)

  // Jamais de cache : une réponse gardée en cache dirait la version
  // précédente après un déploiement, c'est-à-dire l'inverse de ce qu'on lui
  // demande.
  setHeader(event, 'cache-control', 'no-store')

  return buildHealth(build)
})
