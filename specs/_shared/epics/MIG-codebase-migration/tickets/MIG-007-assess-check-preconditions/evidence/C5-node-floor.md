# MIG-7 C5: the Node 22.18 floor

- Read 2026-10-08 at https://nodejs.org/en/blog/release/v22.18.0 (the release notes for "2025-07-31, Version 22.18.0 'Jod' (LTS)").
- The notes carry the section "Type stripping is enabled by default": "Node.js will be able to execute TypeScript files without additional configuration", with the commit "(SEMVER-MINOR) module: unflag --experimental-strip-types". The feature stays experimental and can be turned off with `--no-experimental-strip-types`.
- So `NODE_FLOOR` in `tooling/lib/assess/preconditions.ts` is `22.18.0`: the first release that runs a `.ts` file unflagged, which the toolkit's `node tooling/<script>.ts` scripts need.
- This machine ran Node v22.22.2 for the proof. The predicate itself (three numbers, `v` prefix tolerated, 22.17.9 and 20.19.0 below, 22.18.0 and 24.0.0 at or above) is under C1 in `tooling/migrate-assess-check.test.ts`, which also drives the CLI with `PEM_ASSESS_NODE_VERSION=22.17.9` and reads the failing `node-floor` line.
