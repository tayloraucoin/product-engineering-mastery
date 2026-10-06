# LAB-7 C12 — one served face for a real and an unknown slug

Builder check, 2026-10-06, `next dev` on the branch at 3705f13 with a fresh client (no cookies):

- `GET /experimental/pricing-2026` and `GET /experimental/no-such-review` both answer `200 OK` with `X-Robots-Tag: noindex, nofollow`. `/admin` sends the same header. `/` does not.
- The two bodies are 30,546 and 30,560 bytes. The 14 bytes are the slug's length, which appears in seven places.
- After the slug is replaced by one placeholder in each body, `diff` finds two lines:
  - `self.__next_r="…"`: Next's per-request id. Two requests for the same slug differ here too.
  - `<input type="hidden" name="$ACTION_KEY" value="k…">`: React's `useActionState` key. It is a hash of the action and its bound argument, the slug. Two requests for one slug give the same value, and two different unknown slugs give different values, so it is a function of the path alone. It says nothing a real slug would not.
- Nothing else differs: no title, no design count, no mode, no "no such review".

Method: `curl -s -D` each URL, `sed "s/<slug>/SLUG/g"`, split on `>`, `diff`.
