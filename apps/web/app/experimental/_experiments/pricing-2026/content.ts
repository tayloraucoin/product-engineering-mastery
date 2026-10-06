/**
 * The demo's copy, shared by both designs (S30): a pricing page for a
 * made-up records workspace. Synthetic only: no client, no real person, no
 * price and no email. Billing is described in words so no figure can be
 * mistaken for a real offer.
 */

export type Plan = {
  name: string;
  audience: string;
  billing: string;
};

export const PLANS: readonly Plan[] = [
  {
    name: "Starter",
    audience: "One person keeping their own records",
    billing: "No charge",
  },
  {
    name: "Team",
    audience: "A small team sharing records and reviews",
    billing: "Per editor, monthly; viewers are free",
  },
  {
    name: "Organisation",
    audience: "Several teams with their own admins",
    billing: "Yearly agreement, invoiced",
  },
];

/** One row of the comparison table: what each plan, in PLANS order, includes. */
export type Feature = {
  name: string;
  values: readonly [string, string, string];
};

export const FEATURES: readonly Feature[] = [
  { name: "Records", values: ["Up to 500", "Unlimited", "Unlimited"] },
  { name: "Editors", values: ["1", "Up to 25", "Unlimited"] },
  { name: "Version history", values: ["30 days", "1 year", "Unlimited"] },
  { name: "Review requests", values: ["Not included", "Included", "Included"] },
  {
    name: "Single sign-on",
    values: ["Not included", "Not included", "Included"],
  },
  {
    name: "Audit log export",
    values: ["Not included", "Not included", "Included"],
  },
];

export type Question = { question: string; answer: string };

export const FAQ: readonly Question[] = [
  {
    question: "Who counts as an editor?",
    answer:
      "Anyone who can change a record. People who only read or comment are viewers, and viewers are free on every plan.",
  },
  {
    question: "Can we move between plans?",
    answer:
      "Yes. Moving up takes effect at once; moving down takes effect at the end of the current billing period, and nothing is deleted.",
  },
  {
    question: "What happens to our records if we leave?",
    answer:
      "You can export every record and its history as CSV or JSON at any time, including for 30 days after you close the workspace.",
  },
];
