import { siteNav } from '~~/content/nav'
import { buildSitemap } from '../utils/sitemap'

export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig(event).public

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return buildSitemap(siteUrl, siteNav)
})
