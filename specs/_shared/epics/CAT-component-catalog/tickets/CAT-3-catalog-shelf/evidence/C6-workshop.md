# CAT-3 C6 — the workshop's tag filter and Provenance panel

Captured 2026-10-04 in the built-in browser, against `yarn ui:storybook --ci` (Storybook 10.6.1, port 6006) on commit be5bdc5, at 800 × 600.

## Seen

1. The sidebar shows the kit (`Composed`, `Primitives`, `Providers`) and the shelf (`Catalog / Control / Copy button / Custom`) in one workshop.
2. The sidebar's filter menu lists the story tags with counts: `layer:composed` 10, `layer:primitive` 10, `source:custom` 20, `verdict:kit` 16, `verdict:unruled` 4 ([`C6-tag-filter-menu.jpg`](C6-tag-filter-menu.jpg)).
3. Selecting `verdict:unruled` narrows the sidebar to the four copy-button stories and writes `&tags=verdict:unruled` into the URL, so a filtered view can be shared. Every story today is `source:custom` (shadcn arrives with CAT-4), so selecting it keeps all 20, which is the custom set.
4. The Provenance panel beside Controls, Actions, Interactions and Accessibility shows, for `Catalog / Control / Copy button / Custom / Copied`: Source `custom`, Verdict `unruled`, Layer `composed`, Upstream `taylor-aucoin@7f8a4a1 app/admin/_components/copy-button.tsx (2026-09-25)`, Licence `house`, Adapted `onto @pem/ui Button (outline) and house tokens; words in copy.ts; a failedMessage prop` ([`C6-filtered-provenance.jpg`](C6-filtered-provenance.jpg)).

## Not seen

- The Copied story's "Copied" line in the screenshot: the region clears itself after 2.4 s by design, and the capture was taken later. `yarn test` (C4) proves the line appears.
