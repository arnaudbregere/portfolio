---
version: 1
slug: "app-pages-ds-vue"
primary_target: "app/pages/_ds.vue"
related_targets: ["app/styles/_tokens.scss","app/styles/_fonts.scss","app/utils/contrast.ts"]
---

Scope: the site's visual world plus its specimen sheet. This round ships `app/styles/_tokens.scss`, the self-hosted display face, the WCAG contrast measurement with its Vitest specs, and the development-only route `app/pages/_ds.vue`. The six atoms first written for this round were dropped: a component is born of the page that needs it, and no page needed them yet. It does not ship a public page; P2 and P3 inherit this world.

Visitor mode: Persuade (the public surface). `/_ds` itself is Operate, serving the author and later agents.

Audience: a lead tech or CTO who opens the site on a phone between two meetings, and a recruiter who scans for seniority and a way to make contact. Job: believe within ten seconds that this front-end developer works like a lead. Action: download the CV or open the contact form. Proof available: a measured track record (LCP, CLS, INP on immobilier.lefigaro.fr), a public repository with a green CI, an agentic tooling setup, and a background in graphic arts (Beaux-Arts, BTS Communication Visuelle, licence WebDesign). Constraints: RGAA 4.1 / WCAG 2.1 AA, Lighthouse >= 95 on mobile, no proprietary screenshots from Figaro Classifieds or La Poste, one loaded display face.

Chosen direction: brief-pinned by the user and by issue #1 (Mazarine, arter.studio). The pin beats the roll.

Unresolved: the contact form provider (issue #5) and whether caveman rule files are generated for Cursor, Windsurf, Cline and Copilot.

## Direction contract

THESIS: the site is an editorial specimen sheet that puts the work under examination, and every claim carries its measured figure next to it. It refuses the arrangement this category always ships: a dark terminal hero with a neon accent, a uniform grid of equal project cards, and skill bars standing in for evidence.

OWN-WORLD: warm paper `#F7F4EF` and warm near-black `#14120F`, with sand `#EDE8E0` for the grounds of figures. One carmine ink `#B3122B` is the whole palette's only colour, spent on nothing but what is under examination and the single primary action. One family, Archivo variable: display in caps at the heavy end of the weight axis, set tight at a leading near 1.0; labels at 13px caps, tabular figures everywhere a number appears. Hairline rules divide the page; nothing is boxed in a card and nothing carries a shadow. Controls are hairline rectangles, and pills are reserved for taxonomy alone.

STORY: the visitor understands that this is a front-end developer who came from graphic arts and who measures what he ships. The visitor believes it because every assertion sits beside its figure and the site's own repository, CI and accessibility are part of the evidence. The visitor downloads the CV or opens the contact form.

FIRST VIEWPORT: the public home opens on a ruled sheet head, the name in display caps across the full measure, the role line in 13px caps beneath it. Under one hairline, a two-column row: a 13px caps label on the left margin, and at the optical centre-right one statement sentence set in display, with its structural words dropped to muted and its load-bearing nouns held at full ink. The primary action sits at the left margin directly under that statement, as a hairline rectangle whose ink fill is the page's one carmine. Measured figures follow in tabular numerals, each tied to the claim it proves.

FORM: the brief-pinned editorial sheet (Mazarine's typographic discipline fused with arter.studio's single committed ink), pinned by the user and by issue #1 and therefore ahead of the roll's assigned index 4; seed key fea15835.

RAISE (patent drawing sheet, declined): one annotation ink reserved for what is under examination, and reference numerals tying each claim to its evidence. The pinned world leans on photography that this subject cannot supply, so the reserved ink and the figure numerals carry the burden instead.

RAISE (pachuco zoot handbill, competitive): billing order is the hierarchy. Rank is encoded in type size, not in a uniform grid of equal cards.

RAISE (collider event display, declined): magnitude is written into the figure itself, in tabular numerals, rather than claimed in prose.

RAISE (azulejo station hall, declined): layout snaps to whole units and the grid admits its seams, rather than hiding them behind fractional gutters.

RAISE (ebru floated pigment, declined): one surface, one pass. The evidence stays on the page instead of hiding behind a hover or an accordion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
