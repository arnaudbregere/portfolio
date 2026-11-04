import type { Project } from '~~/content/types'

/**
 * JSON-LD `CreativeWork` d'une fiche projet : dit à un moteur de recherche que
 * la page décrit une réalisation, et qui l'a faite. Partagé par la route
 * dynamique et par les pages de démonstration, pour que les deux décrivent
 * leurs fiches de la même façon.
 */
export const useProjectJsonLd = (project: Project, siteUrl: string) => {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: project.title,
          abstract: project.problem,
          dateCreated: project.year,
          creator: { '@type': 'Person', name: 'Arnaud Brégère', url: siteUrl },
          keywords: project.stack.join(', '),
          url: `${siteUrl.replace(/\/$/, '')}/projets/${project.slug}`,
        }),
      },
    ],
  })
}
