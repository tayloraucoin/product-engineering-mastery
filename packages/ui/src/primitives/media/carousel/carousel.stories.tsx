import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

type Args = { orientation?: "horizontal" | "vertical" };

const slides = ["Kitchen", "Living room", "Garden", "Studio"];

const meta = {
  title: "Primitives/Media/Carousel",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/carousel.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
  render: ({ orientation }: Args) => (
    <Carousel
      orientation={orientation}
      className="mx-auto w-full max-w-xs"
      aria-label="Listing photos"
    >
      <CarouselContent
        className={orientation === "vertical" ? "h-48" : undefined}
      >
        {slides.map((room) => (
          <CarouselItem key={room}>
            <div className="flex aspect-video items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
              {room}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  play: async ({ canvas }) => {
    const region = canvas.getByRole("region", { name: "Listing photos" });
    await expect(region).toHaveAttribute("aria-roledescription", "carousel");
    await expect(within(region).getAllByRole("group")).toHaveLength(4);
    await expect(
      canvas.getByRole("button", { name: /previous slide/i }),
    ).toBeDisabled();
  },
};

export const Vertical: Story = { args: { orientation: "vertical" } };
