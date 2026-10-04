# Which components did the five past product repos build, and which custom ones are worth a catalog entry?

Surveyed 2026-10-04 by one read-only pass over five repos. Every claim is verified (read from the code) unless labelled. No `.env` file was read; `node_modules`, build output and `.claude/worktrees/` copies were skipped. Line counts are `wc -l`.

## Answer

The five repos are one lineage. agora (2024-09 to 2026-04) kept heavily branded shadcn copies app-locally on Tailwind 3. cho-verse (2026-04 to 08) moved them into a shared package with the first Storybook and the first registry (`@diceui`). Conscious Connections (2026-05 to 09) introduced the primitives/composed split and the story-first rule. taylor-aucoin (2026-07 to 09) went bespoke by rule. Synapse (2026-09 to 10) formalised the CC layout this repo now uses. Twenty-nine custom jobs were built in two to five repos each; those are the catalog's `custom` candidates, in the order below. Flex/Grid layout and prop-driven typography recur in every repo and are foundation, not catalog entries.

## Evidence

### Timeline

| Repo | Path | Dates | Base | Tailwind | Shift from the previous repo |
| --- | --- | --- | --- | --- | --- |
| agora-virtual-mall | `lighthouse/agora/v3/agora-virtual-mall` | 2024-09-30 to 2026-04-07 | shadcn `default`, individual `@radix-ui/*`; custom `brand-primary` baseColor | 3.4 + plugins | Starting point: app-local `components/ui` by kind; 13-variant button; Dice UI Sortable and ColorSwatch, Credenza, sersavan multi-select vendored; three animation libraries; no Storybook |
| cho-verse | `lighthouse/_archive/cho-ventures/cho-verse` | 2026-04-10 to 2026-08-17 | shadcn `default` on Radix, Base UI combobox; `@diceui` registry | 4 | Shared `@cho-verse/ui`, Storybook 8.6 (60 stories), composite APIs with `classes` props; adoption uneven across apps |
| conscious-connections | `lighthouse/conscious-connections/conscious-connections` | 2026-05-09 to 2026-09-08 | shadcn-derived on `@radix-ui/*`, no components.json | 4 | primitives/composed split, story-first rule (111 stories), brand registers, ElevenLabs UI waveform vendored, SVG charts by hand |
| taylor-aucoin | `lighthouse/taylor-aucoin` | 2026-07-20 to 2026-09-26 | none by rule (Radix select, sheet, dialog in `/admin` only) | 4 (CSS-first) | Bespoke: GradientRing, RootField canvas, intake kit |
| synapse | `lighthouse/synapse` | 2026-09-04 to 2026-10-04 | shadcn `new-york` on `radix-ui`; CLI lands in `_shadcn`, then re-slotted | 4 (preset tokens) | CC layout formalised: `.variants.ts`, a story per component (140), many components "adapted from CC" |

### Custom candidates, ranked (repos with a build)

| # | Job | Strongest build (repo: path) | Also built in |
| --- | --- | --- | --- |
| 1 | Sortable / repeatable list | synapse: `packages/ui/src/composed/control/sortable-list` (292) | CC repeatable-list, ranked-list; taylor-aucoin repeatable-block; agora dnd-reorder; cho-verse DragReorderList |
| 2 | Responsive sheet (dialog on desktop, drawer on mobile) | synapse: `composed/layout/responsive-sheet` (254) | CC drawer-dialog, side-channel-drawer; agora dialog-drawer |
| 3 | Overflow menu from an items array | synapse: `composed/control/ellipses-menu` (120) | CC, cho-verse, agora (one lineage) |
| 4 | Search field with clear | CC: `composed/control/search-field` (166) | synapse, cho-verse, agora |
| 5 | Save status | synapse: `composed/feedback/save-status` (57) | CC autosave-banner; taylor-aucoin save-indicator |
| 6 | Auth capture panel | CC: `composed/auth/auth-capture/auth-capture-panel.tsx` (899) | cho-verse auth-capture-dialog; synapse auth-frame; agora |
| 7 | OAuth button | synapse: `composed/control/oauth-button` (81) | cho-verse google-sign-in-button; agora |
| 8 | Empty state | CC: `composed/display/empty-state` (190) | synapse, agora, cho-verse |
| 9 | Emoji and icon picker | cho-verse: `control/emoji-icon-picker` (350) | CC and synapse emoji-picker (Frimousse); synapse curated-icon-grid |
| 10 | Theme control | synapse: `composed/control/theme-control` (130) | taylor-aucoin ThemeToggle; cho-verse; this repo's theme-toggle |
| 11 | Rich text (Tiptap to Markdown) | synapse: `composed/control/rich-text-editor` (312) | cho-verse rich-text-editor; cho-verse RichTextField |
| 12 | Media lightbox / gallery | taylor-aucoin: `components/work/MediaLightbox.tsx` (407) | CC image-gallery; agora image carousels |
| 13 | Voice capture and playback | taylor-aucoin: `app/websites/coded/intake/_components/voice-recorder.tsx` (977) | CC audio-scrubber, waveform (ElevenLabs UI), voice-message-button |
| 14 | Kanban board with drag | synapse: `composed/layout/board/` (285 + 724) | CC leads-board; cho-verse deals kanban |
| 15 | Step / wizard frame | synapse: `composed/layout/step-frame` (194) | CC question-frame, step-nav; taylor-aucoin step-shell; agora stepper-progress |
| 16 | Loading text | CC: `composed/feedback/loading-text` (58), warm-loading (146) | synapse; taylor-aucoin working-indicator |
| 17 | Timestamp with sr-only exact time | CC: `primitives/typography/timestamp` (122) | synapse time-text |
| 18 | Segmented control | synapse: `composed/control/segmented-control` (147) | CC |
| 19 | Expandable / read-more text | CC: `composed/display/expandable-text` (112) | agora read-more, expandable-fade |
| 20 | Chip and tag inputs | synapse: tag-input (178), chip-picker (155), weekday-chips (190) | agora tag-select; CC ranked-interest-chips |
| 21 | Admin shell with flyouts | CC: `composed/navigation/admin-shell/` (9 files) | cho-verse hq-ops shell; taylor-aucoin admin-shell |
| 22 | File picker and dropzone | taylor-aucoin: `app/websites/intake/_components/file-drop.tsx` (620) | cho-verse FileBrowser, file-picker; agora image-upload |
| 23 | Scroll reveal and parallax | cho-verse foc-website: `components/motion/Reveal.tsx` (162), Parallax (134) | cho-verse tony-cho ScrollReveal |
| 24 | Review pin-comment overlay | cho-verse foc-website: `components/feedback/` (PinLayer 412) | cho-verse tony-cho (built twice) |
| 25 | Copy to clipboard | taylor-aucoin: `app/admin/_components/copy-button.tsx` (71) | cho-verse copy-text-button |
| 26 | Place / city autocomplete | cho-verse: `control/geo-suggest` (274) | agora geo-suggest; cho-verse CityAutocomplete |
| 27 | PWA install and push banner | CC toolkit: `app/_components/install-banner.tsx` (241) | agora install-banner |
| 28 | Safe markdown-subset renderer | CC: `composed/display/coach-markdown` (228) | taylor-aucoin markup |
| 29 | Inline click-to-edit field | cho-verse hq-ops: `crm/_shared/components/inline-edit-field.tsx` (103) | cho-verse chozen editable-field |
| 30 | Single-repo standouts | synapse image-cropper (202), typed-confirm-dialog, discard-dialog, count-stepper, time-field, timezone-select; taylor-aucoin GradientRing (110), ConsentBanner (94); agora masonry-grid (285), tooltip-popover (158); CC thread-tabs (230) | — |

Third-party code found in the repos: Dice UI Sortable, ColorSwatch and Color Picker (agora, cho-verse), Credenza and sersavan multi-select (agora), ElevenLabs UI waveform (CC), Frimousse (CC, synapse). Kibo UI Announcement in agora is inference only.

## Not found

- Magic UI, Aceternity, Origin UI, tablecn, ReUI, Animate UI, React Bits or Motion Primitives code in any repo.
- A shared ui package or Storybook in agora; a component library in taylor-aucoin outside `/admin`.

## Promote to library

No. The catalog's manifest and `custom` stories carry what outlives the epic; this note stays the record of where each lift came from.
