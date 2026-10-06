/**
 * The demo experiment (S30): one synthetic pricing page in two designs.
 * Circle leads with the plans; Square leads with the comparison table.
 * No JSX and no static .tsx import, so node loads this file.
 */
import type { ExperimentConfigInput } from "../registry.ts";

export const pricing2026 = {
  slug: "pricing-2026",
  title: "Pricing page, 2026",
  designs: [
    {
      id: "circle",
      shape: "circle",
      component: () => import("./circle.tsx").then((m) => m.CircleDesign),
    },
    {
      id: "square",
      shape: "square",
      component: () => import("./square.tsx").then((m) => m.SquareDesign),
    },
  ],
  goals: [
    "A visitor can tell which plan fits their team without contacting us",
    "A visitor can see what changes between plans before choosing one",
  ],
  questions: [
    {
      id: "missing-detail",
      text: "What did you need to know that the page did not tell you?",
    },
  ],
  mode: "private",
  coreVersion: "v1",
  closedOn: null,
} satisfies ExperimentConfigInput;
