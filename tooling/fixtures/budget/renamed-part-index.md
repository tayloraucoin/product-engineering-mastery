# Synthetic budget map: the UI row renames "always", so the check must fail on the missing label.

| Build                   | Loads                                                                                                 | Cap (tokens) |
| ----------------------- | ----------------------------------------------------------------------------------------------------- | ------------ |
| UI build                | always-on load 100 + design layer 100 + brief and package 100 + references 100 + one skill body 100 | 100          |
| Non-UI build            | always 100 + path rules and nested `AGENTS.md` 100 + contract and cited spec 100                | 100          |
| Critic pass (forked)    | `canon-rubric.md` and canon §2 + the cited surface file + ≤3 exemplars (screenshots excluded)         | 100          |
| Evaluator pass (forked) | evaluator body 100 + contract and cited spec 100 + evidence index 100 | 100          |
