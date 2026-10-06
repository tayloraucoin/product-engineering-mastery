---
epic: LAB
status: approved
---

# LAB — test shape per risk

| Risk                           | Test                                                                                                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Isolation (door 4)             | Integration on local Postgres in `packages/db/test/sandbox/`, over every `@pem/db/sandbox` function crossed with every kind of viewer (two reviewers, two slugs, developer, admin): no read or write crosses |
| One face (C-LAB-gate-1, 2)     | Integration: real, unknown, revoked and closed-without-code responses compared, per-request tokens stripped                                                                                                  |
| Codes, cookies, link, throttle | Unit, plus generated inputs: any spacing, case or confusable variant normalises to the same code, and any one-symbol change fails                                                                            |
| Erasure (S28)                  | Integration: one code with two emails on two slugs; erase one, then a sweep of every sandbox table and label finds it nowhere, and the record holds counts only                                              |
| Retries                        | Integration: the same comment or version id sent twice gives one row                                                                                                                                         |
| Roles                          | Unit (`roleOf` with `developer`); action test for the last-admin guard                                                                                                                                       |
| Journeys                       | No end-to-end runner exists (not found, 2026-10-05). Server-action integration tests stand in                                                                                                                |
| UI                             | Captures of every `?state=` key at 390, 834 and 1440, light and dark                                                                                                                                         |
