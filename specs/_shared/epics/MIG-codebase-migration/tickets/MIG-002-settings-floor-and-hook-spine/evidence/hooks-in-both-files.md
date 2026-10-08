# C6 — hooks registered in both settings files

- **Date:** 2026-10-07, session started 19:58:40 UTC.
- **Claude Code:** `2.1.232 (Claude Code)` (`claude` on the PATH, Node v22.22.2).
- **Result:** the claim holds. One headless session ran both hooks: `session-start.ts` from the tracked `.claude/settings.json` and `stop-gate.ts` from the gitignored `.claude/settings.local.json`, under the same session id.

## The scratch repo

A fresh git repo in the session's scratchpad, synthetic, one commit. Each hook is a one-line stand-in that appends its own name, the event and the session id to `markers.txt` (gitignored); neither is the toolkit's hook.

Tracked (`git ls-files`):

```
.claude/settings.json
.gitignore
tooling/hooks/session-start.ts
tooling/hooks/stop-gate.ts
```

`.claude/settings.json` (tracked):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PROJECT_DIR}/tooling/hooks/session-start.ts\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

`.claude/settings.local.json` (gitignored):

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PROJECT_DIR}/tooling/hooks/stop-gate.ts\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

`tooling/hooks/session-start.ts` (`stop-gate.ts` is the same with its own name):

```ts
import { appendFileSync, readFileSync } from "node:fs";

const event = JSON.parse(readFileSync(0, "utf8")) as {
  hook_event_name?: string;
  session_id?: string;
};
appendFileSync(
  `${process.env.CLAUDE_PROJECT_DIR}/markers.txt`,
  `session-start.ts fired: ${event.hook_event_name} ${event.session_id}\n`,
);
```

## The session

Run from the repo's root, outside the sandbox, with no permission flags:

```
claude -p "say ok" --output-format json
```

Exit 0. The result: `{"type": "result", "subtype": "success", "is_error": false, "result": "ok", "session_id": "18917455-db87-485b-a873-075ca05f7a36", "num_turns": 1}`

## markers.txt after the session

```
session-start.ts fired: SessionStart 18917455-db87-485b-a873-075ca05f7a36
stop-gate.ts fired: Stop 18917455-db87-485b-a873-075ca05f7a36
```

Both lines carry the session id the result reports, so both hooks fired in that one session.
