import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { ThemeProvider } from "../../../providers/theme/theme-provider";
import { THEME_TOGGLE_COPY } from "./copy";
import { ThemeToggle } from "./theme-toggle";

const { options } = THEME_TOGGLE_COPY;

/**
 * The toggle drives the real `.dark` class, so the toolbar's is off. Each
 * story mounts it under `ThemeProvider`, as the app does, unless it sets
 * `withoutProvider`.
 */
const meta = {
  title: "Composed/Control/Theme toggle",
  component: ThemeToggle,
  decorators: [
    (Story, { parameters }) =>
      parameters.withoutProvider ? (
        <Story />
      ) : (
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      ),
  ],
  tags: ["source:custom", "verdict:kit", "layer:composed"],
  parameters: {
    themes: { disable: true },
    provenance: {
      upstream: "this repo, STK-6 20c2a31 (2026-10-03), on next-themes 0.4.6",
      licence: "house",
      adapted:
        "built here; the same job was built in Synapse, taylor-aucoin and cho-verse",
    },
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Before the stored theme is known (server render, hydration): nothing is
 * selected, and the first option is the tab stop.
 */
export const Unresolved: Story = {
  parameters: { withoutProvider: true },
  play: async ({ canvas }) => {
    for (const radio of canvas.getAllByRole("radio"))
      await expect(radio).not.toBeChecked();
    await userEvent.tab();
    await expect(
      canvas.getByRole("radio", { name: options.light }),
    ).toHaveFocus();
  },
};

/** No stored choice: "system", the provider's default, is selected. */
export const System: Story = {
  parameters: { storedTheme: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("radio", { name: options.system, checked: true }),
    ).toBeVisible();
  },
};

export const Light: Story = {
  parameters: { storedTheme: "light" },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole("radio", {
        name: options.light,
        checked: true,
      }),
    ).toBeVisible();
  },
};

export const Dark: Story = {
  parameters: { storedTheme: "dark" },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole("radio", {
        name: options.dark,
        checked: true,
      }),
    ).toBeVisible();
    await expect(document.documentElement).toHaveClass("dark");
  },
};

/** One tab stop; the arrow keys move the selection and the focus together. */
export const Keyboard: Story = {
  parameters: { storedTheme: "light" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const light = await canvas.findByRole("radio", {
      name: options.light,
      checked: true,
    });
    await userEvent.tab();
    await expect(light).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    const dark = canvas.getByRole("radio", { name: options.dark });
    await expect(dark).toBeChecked();
    await expect(dark).toHaveFocus();
    await userEvent.keyboard("{End}");
    const system = canvas.getByRole("radio", { name: options.system });
    await expect(system).toBeChecked();
    await expect(system).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(light).toBeChecked();
    await expect(light).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(system).toBeChecked();
    await userEvent.keyboard("{Home}");
    await expect(light).toBeChecked();
    await expect(light).toHaveFocus();
  },
};

export const Click: Story = {
  parameters: { storedTheme: "light" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole("radio", { name: options.light, checked: true });
    await userEvent.click(canvas.getByRole("radio", { name: options.dark }));
    await expect(
      canvas.getByRole("radio", { name: options.dark }),
    ).toBeChecked();
    await expect(document.documentElement).toHaveClass("dark");
  },
};
