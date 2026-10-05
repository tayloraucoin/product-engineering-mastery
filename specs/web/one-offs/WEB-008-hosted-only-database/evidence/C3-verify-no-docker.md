# WEB-8 C3 — yarn verify with no Docker daemon

Statement: `yarn verify` exits 0 with no Docker daemon running.

How: run by the thread, outside the sandbox (turbo hashes `packages/db/.env.local`, which the sandbox denies), on the committed tree. Docker's state was captured first; `yarn verify` was then run once, in full. The full log (3,094 lines) is not committed, as evidence logs never are; the lines below are its head and tail, and the one line per check that names its result.

## Docker

```
docker version --format '{{.Server.Version}}' at 2026-10-05T22:36:33Z, head 2e8d5aa956a7f3dc10c89730c82d169c39eb3f85:
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?

docker exit: 1
```

## yarn verify

```
command: yarn verify
head: 3b3a7a5995cf904086cae5558e0d55844acd8207
exit: 0
---
Checking formatting...
All matched files use Prettier code style!
lint:docs — 213 files, names and frontmatter clean; 8 path rules carry only paths.
check-settings — 12 fixtures behaved; .claude/settings.json is clean.
test:hooks — every case behaved.
  bash-guard: 120 cases, 9 rules; median 59 ms, max 94 ms per call; longest denial about 53 tokens
  results-gate: 14 cases, 4 rules; median 55 ms, max 56 ms per call; longest denial about 48 tokens
  session-start: 5 cases, 4 rules; median 59 ms, max 61 ms per call; answers as context
  stop-gate: 8 cases, 4 rules; median 58 ms, max 59 ms per call; answers as stop
check-refs — every reference in 128 live files resolves; 42 pending (lands in J8, lands in J11, superseded by docs/runbooks/new-project/README.md (STK-3), lands in P-C, retired by PR-19; stale ledge
check-stack — 16 module(s); nothing missing, nothing left behind.
check-migrations: 2 migration(s) in packages/db/migrations, none touch the auth schema.
...
lint:docs — 213 files, names and frontmatter clean; 8 path rules carry only paths.
check-settings — 12 fixtures behaved; .claude/settings.json is clean.
test:hooks — every case behaved.
check-refs — every reference in 128 live files resolves; 42 pending (lands in J8, lands in J11, superseded by docs/runbooks/new-project/README.md (STK-3), lan
check-stack — 16 module(s); nothing missing, nothing left behind.
check-specs — 29 fixtures behaved; specs/ is clean.
check-test-weakening — 10 fixtures behaved; no weakening against main.
# tests 172
# pass 172
# fail 0
# tests 4
# pass 4
# fail 0
# tests 8
# pass 8
# fail 0
# tests 14
# pass 14
# fail 0
# tests 17
# pass 17
# fail 0
# tests 17
# pass 17
# fail 0
# tests 27
# pass 27
# fail 0
# tests 29
# pass 29
# fail 0
# tests 30
# pass 30
# fail 0
# tests 13
# pass 13
# fail 0
# tests 7
# pass 7
# fail 0
...
 Tasks:    2 successful, 2 total
Cached:    0 cached, 2 total
  Time:    11.867s 

```
