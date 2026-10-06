import { buttonVariants } from "@pem/ui/button";
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
 * Design Circle: the plans first, as a list of who each one is for, then
 * the comparison table, then questions. Every section carries its region
 * marker (`data-sandbox-region`, `data-sandbox-name`), read by the pins.
 */
export function CircleDesign() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-6 py-12">
      <section
        data-sandbox-region="intro"
        data-sandbox-name="Introduction"
        className="flex max-w-prose flex-col gap-4"
      >
        <h1 className="text-3xl font-semibold tracking-tight">
          Plans for every size of team
        </h1>
        <p className="text-muted-foreground">
          Start on your own, add your team when you need review, and move to
          Organisation when several teams share one workspace.
        </p>
        <div>
          <a href="#circle-compare" className={buttonVariants()}>
            Compare plans
          </a>
        </div>
      </section>

      <section
        data-sandbox-region="plans"
        data-sandbox-name="Plans"
        aria-labelledby="circle-plans-heading"
        className="flex flex-col gap-6"
      >
        <h2 id="circle-plans-heading" className="text-xl font-semibold">
          Which plan fits
        </h2>
        <ul className="flex flex-col divide-y border-y">
          {PLANS.map((plan) => (
            <li
              key={plan.name}
              className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-6"
            >
              <span className="font-medium">{plan.name}</span>
              <span className="text-muted-foreground">{plan.audience}</span>
              <span className="text-muted-foreground">{plan.billing}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="circle-compare"
        data-sandbox-region="compare"
        data-sandbox-name="Comparison table"
        aria-labelledby="circle-compare-heading"
        className="flex flex-col gap-6"
      >
        <h2 id="circle-compare-heading" className="text-xl font-semibold">
          What each plan includes
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              {PLANS.map((plan) => (
                <TableHead key={plan.name}>{plan.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
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
        data-sandbox-region="faq"
        data-sandbox-name="Questions"
        aria-labelledby="circle-faq-heading"
        className="flex max-w-prose flex-col gap-6"
      >
        <h2 id="circle-faq-heading" className="text-xl font-semibold">
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
