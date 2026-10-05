import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu";

const meta = {
  title: "Primitives/Navigation/Navigation menu",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/navigation-menu.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "the viewport's 0.35s on the moderate motion token; the arrow's px offset on the spacing scale",
    },
  },
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-64 gap-1 p-2">
              <li>
                <NavigationMenuLink href="#invoicing">
                  Invoicing
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#payroll">Payroll</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Reached from the keyboard: the trigger takes focus, and the plain link follows. */
export const Keyboard: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "Products" }),
    ).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Pricing" })).toHaveFocus();
  },
};
