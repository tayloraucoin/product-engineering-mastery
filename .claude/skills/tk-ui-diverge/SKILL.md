---
name: tk-ui-diverge
description: "Build exactly three routes for one screen that differ on one named axis (layout strategy by default), using only tokens and @pem/ui. Manual only: /tk-ui-diverge <feature> <axis>."
argument-hint: <feature> [axis]
disable-model-invocation: true
allowed-tools: Read Grep Glob Write Edit Bash(yarn lint *) Bash(yarn check-types *) Bash(yarn prettier *)
disallowed-tools: WebFetch
---

Build three directions for `$0`, diverging on the axis `$1` (default: layout strategy).

1. **Read first:** the feature's `package.md` or UX file, `docs/design/canon.md`, and the product design layer when it exists. For the layout axis also read `docs/references/README.md` and at most 3 files it routes to (CF-31).
2. **Hold everything else.** The current screen is the control: same content, same words, same fixture rows, same tokens. Exactly one axis moves per direction; if two things differ between directions, the comparison is void.
3. **Three routes**, never two or four: `app/demo/diverge/<feature>/<direction>/page.tsx` (in a product app, the same shape under its own diverge folder). Name each direction by what it does (`rows`, `cards`, `grouped`), not A, B, C. Share the held content through one `_shared/` folder so the directions cannot drift.
4. **Vocabulary:** `@pem/ui` components and tokens only. No new palette, face, radius, shadow or raw value. Populated state only unless the axis is about a state.
5. **Isolation:** no link from the shipped nav; nothing imports a direction; each folder deletes cleanly.
6. **Check:** `yarn lint` and `yarn check-types`. Capture each at 390 and 1440, light and dark, for the operator to compare.
7. **Stop.** Report the three routes and what each trades off. Choosing and converging is the operator's, then `shadcn` and `components.md`.
