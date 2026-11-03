import { buildRobots } from '../utils/sitemap'

export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig(event).public

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return buildRobots(siteUrl)
})
