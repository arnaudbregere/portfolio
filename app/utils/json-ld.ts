/**
 * Sérialise un objet pour un `<script type="application/ld+json">`.
 *
 * `JSON.stringify` échappe les guillemets et les sauts de ligne, **pas le
 * chevron ouvrant**. Une séquence `</script>` présente dans une valeur
 * refermerait donc le bloc, et ce qui la suit serait lu comme du balisage par
 * l'analyseur HTML — qui ne sait pas qu'il est à l'intérieur d'un script.
 *
 * Le contenu du site est écrit à la main dans `content/`, en TypeScript typé :
 * aucun tiers ne peut y glisser cette séquence aujourd'hui. L'échappement est
 * posé parce qu'il coûte une ligne, qu'il est la pratique établie pour le
 * JSON-LD, et que la politique de sécurité du contenu tolère le script en
 * ligne (`server/utils/security-headers.ts`) — c'est la seule couture de cet
 * argument, autant la coudre.
 *
 * `<` est la forme échappée de `<` dans une chaîne JSON : le document
 * reste du JSON valide, et un moteur de recherche le relit à l'identique.
 */
export const jsonLdScript = (data: unknown) =>
  JSON.stringify(data).replace(/</g, '\\u003c')
