import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { expect } from "storybook/test";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  withoutAnimation,
  type ChartConfig,
} from "./chart";

type Args = { legend?: boolean };

const data = [
  { month: "May", signups: 186, upgrades: 80 },
  { month: "Jun", signups: 305, upgrades: 120 },
  { month: "Jul", signups: 237, upgrades: 98 },
  { month: "Aug", signups: 273, upgrades: 131 },
];

const config = {
  signups: { label: "Sign-ups", color: "var(--chart-1)" },
  upgrades: { label: "Upgrades", color: "var(--chart-2)" },
} satisfies ChartConfig;

const meta = {
  title: "Primitives/Display/Chart",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/chart.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "default grid, dot and sector strokes matched by :not([stroke^='var(']) instead of recharts' literal hex; the dashed indicator's 1.5px border on border-2; values never animate (A-14), so every series sets",
    },
  },
  render: ({ legend }: Args) => (
    <ChartContainer
      config={config}
      className="min-h-48 w-full max-w-md"
      role="figure"
      aria-label="Sign-ups and upgrades by month"
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {legend ? <ChartLegend content={<ChartLegendContent />} /> : null}
        <Bar dataKey="signups" fill="var(--color-signups)" radius={4} />
        <Bar dataKey="upgrades" fill="var(--color-upgrades)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bars: Story = {
  play: async ({ canvas }) => {
    const figure = canvas.getByRole("figure", {
      name: "Sign-ups and upgrades by month",
    });
    await expect(figure).toHaveAttribute("data-slot", "chart");
    await expect(figure.querySelector("style")?.textContent).toContain(
      "--color-signups: var(--chart-1)",
    );
  },
};

export const WithLegend: Story = { args: { legend: true } };

/**
 * Values never tween (A-14): every series and the tooltip start still unless
 * the caller opts in. jsdom draws no bars, so this checks the props the kit
 * hands Recharts.
 */
export const StillByDefault: Story = {
  play: async () => {
    const chart = withoutAnimation(
      <BarChart data={data}>
        <Bar dataKey="signups" />
        <Bar dataKey="upgrades" isAnimationActive />
        <ChartTooltip />
        <XAxis dataKey="month" />
      </BarChart>,
    );
    const [signups, upgrades, tooltip, axis] = React.Children.toArray(
      (chart.props as { children: React.ReactNode }).children,
    ) as React.ReactElement<Record<string, unknown>>[];
    await expect(signups!.props.isAnimationActive).toBe(false);
    await expect(upgrades!.props.isAnimationActive).toBe(true);
    await expect(tooltip!.props.isAnimationActive).toBe(false);
    await expect(axis!.props).not.toHaveProperty("isAnimationActive");
  },
};
