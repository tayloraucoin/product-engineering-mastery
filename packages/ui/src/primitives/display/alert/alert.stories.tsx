import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CircleAlert, Info } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../control/button/button";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "./alert";

type Args = { variant?: "default" | "destructive"; action?: boolean };

const meta = {
  title: "Primitives/Display/Alert",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/alert.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "cva in alert.variants.ts; the destructive description on solid text-destructive rather than /90",
    },
  },
  render: ({ variant, action }: Args) => (
    <Alert variant={variant} className="w-96">
      {variant === "destructive" ? (
        <CircleAlert aria-hidden />
      ) : (
        <Info aria-hidden />
      )}
      <AlertTitle>
        {variant === "destructive"
          ? "The export failed"
          : "Exports run overnight"}
      </AlertTitle>
      <AlertDescription>
        {variant === "destructive"
          ? "The file was too large. Narrow the date range and try again."
          : "Large exports are emailed to you when they finish."}
      </AlertDescription>
      {action ? (
        <AlertAction>
          <Button size="xs" variant="outline">
            Try again
          </Button>
        </AlertAction>
      ) : null}
    </Alert>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Exports run overnight",
    );
  },
};

/** A failure that says what happened and what to do (J-35). */
export const Destructive: Story = { args: { variant: "destructive" } };

export const WithAction: Story = {
  args: { variant: "destructive", action: true },
};
