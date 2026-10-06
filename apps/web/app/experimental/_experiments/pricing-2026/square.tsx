import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pem/ui/table";

import { FAQ, FEATURES, PLANS } from "./content.ts";

/**
 * Design Square: the comparison table first, with billing as its first row,
 * beside a short guide to choosing, then questions. Every section carries
 * its region marker (`data-sandbox-region`, `data-sandbox-name`), read by
 * the pins.
 */
export function SquareDesign() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12">
      <section
        data-sandbox-region="intro"
        data-sandbox-name="Introduction"
        className="flex max-w-prose flex-col gap-3"
      >
        <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
        <p className="text-muted-foreground">
          Three plans, compared line by line. Viewers are free on every plan;
          you pay only for the people who edit.
        </p>
      </section>

      <div className="grid gap-12 lg:grid-cols-3">
        <section
          data-sandbox-region="compare"
          data-sandbox-name="Comparison table"
          aria-labelledby="square-compare-heading"
          className="flex flex-col gap-4 lg:col-span-2"
        >
          <h2 id="square-compare-heading" className="sr-only">
            Plans compared
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <span className="sr-only">Feature</span>
                </TableHead>
                {PLANS.map((plan) => (
                  <TableHead key={plan.name}>{plan.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Billing</TableCell>
                {PLANS.map((plan) => (
                  <TableCell key={plan.name} className="whitespace-normal">
                    {plan.billing}
                  </TableCell>
                ))}
              </TableRow>
              {FEATURES.map((feature) => (
                <TableRow key={feature.name}>
                  <TableCell className="font-medium">{feature.name}</TableCell>
                  {feature.values.map((value, i) => (
                    <TableCell key={PLANS[i]?.name}>{value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section
          data-sandbox-region="choose"
          data-sandbox-name="Choosing a plan"
          aria-labelledby="square-choose-heading"
          className="flex flex-col gap-4"
        >
          <h2 id="square-choose-heading" className="text-xl font-semibold">
            Choosing a plan
          </h2>
          <ul className="flex flex-col gap-4">
            {PLANS.map((plan) => (
              <li key={plan.name} className="flex flex-col gap-1">
                <span className="font-medium">{plan.name}</span>
                <span className="text-muted-foreground">{plan.audience}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section
        data-sandbox-region="faq"
        data-sandbox-name="Questions"
        aria-labelledby="square-faq-heading"
        className="flex max-w-prose flex-col gap-6 border-t pt-12"
      >
        <h2 id="square-faq-heading" className="text-xl font-semibold">
          Questions
        </h2>
        <dl className="flex flex-col gap-6">
          {FAQ.map((item) => (
            <div key={item.question} className="flex flex-col gap-1">
              <dt className="font-medium">{item.question}</dt>
              <dd className="text-muted-foreground">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
