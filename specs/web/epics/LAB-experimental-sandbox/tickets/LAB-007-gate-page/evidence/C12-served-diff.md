# LAB-7 C12 — one served face for a real and an unknown slug

Builder check, 2026-10-06. `next dev` served the code at d813259, LAB-7's last code commit; the evidence commit that records this changes nothing else. The client was fresh, with no cookies.

- `GET /experimental/pricing-2026` and `GET /experimental/no-such-review` both answer `200 OK` with `X-Robots-Tag: noindex, nofollow`.
- The two bodies differ in length by 14 bytes: the slug's extra two characters, in seven places.
- With the slug replaced by one placeholder in each body, `diff` finds two lines:
  - `self.__next_r`: Next's per-request id. Two requests for the same slug differ here too (second diff below).
  - `$ACTION_KEY`: React's `useActionState` key, a hash of the action and its bound argument, the slug. It is the same on every request for one slug and differs between slugs, so it is a function of the path alone. It says nothing a real slug would not.
- Nothing else differs: no title, no design count, no mode, no "no such review".

Method: `curl -s -D` each URL, `sed "s/<slug>/SLUG/g"`, split on `>`, `diff`. Output:

```text
h-no-such-review.txt:HTTP/1.1 200 OK
h-no-such-review.txt:X-Robots-Tag: noindex, nofollow
h-pricing-2026.txt:HTTP/1.1 200 OK
h-pricing-2026.txt:X-Robots-Tag: noindex, nofollow

   30740 b-pricing-2026.html
   30754 b-no-such-review.html
   61494 total

$ diff real unknown
159c159
< <input type="hidden" name="$ACTION_KEY" value="k6b3f229c2201ad9924aa7908e3f5b342"/
---
> <input type="hidden" name="$ACTION_KEY" value="kff02ad3a45cf05f5a70a26ab62716400"/
188c188
< self.__next_r="rX6KftntZHzj50FIvze43";if(document.cookie.indexOf('next-instant-navigation-testing=')
---
> self.__next_r="qhEe7_sre1RVxqUapI5p-";if(document.cookie.indexOf('next-instant-navigation-testing=')

$ diff real real-again
188c188
< self.__next_r="rX6KftntZHzj50FIvze43";if(document.cookie.indexOf('next-instant-navigation-testing=')
---
> self.__next_r="4_m8P9qOFCDQbYouRAG3F";if(document.cookie.indexOf('next-instant-navigation-testing=')
```
