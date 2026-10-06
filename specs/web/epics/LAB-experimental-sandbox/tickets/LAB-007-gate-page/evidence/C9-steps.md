# LAB-7 C9 — keyboard alone and a screen reader (operator check)

Checked by the builder on 2026-10-06 (keyboard and ARIA wiring, in Chromium on `yarn web:dev`):

- Nothing is focused on load. Tab order: the page's theme toggle, "Your email", "Access code", "Open the review", "On the team? Sign in instead". On the signed-in face, "Sign out" comes before "Access code".
- Enter in either field submits. After a press with errors, focus moves to the first field in error. Each error has an id that its field's `aria-describedby` names, the field has `aria-invalid`, and the error is a `role="alert"` region. The code field's description always includes the hint.
- A lock is read through the code field: same wiring, with a `<time>` element carrying the instant.

Left for a person, with VoiceOver (macOS: Cmd+F5) or NVDA:

1. Open `/experimental/pricing-2026` with no access.
2. With the keyboard alone, press "Open the review" with both fields empty. Each field's error must be announced when focus lands on it.
3. Type a valid email and a wrong code, then submit. The wrong-code sentence must be announced on "Access code".
4. Submit four more wrong codes. "Too many tries. You can try again after …" must be announced with a time, and the button must be announced as dimmed or unavailable.
5. Open `?state=gate-signed-in` and reach "Sign out" by keyboard.
