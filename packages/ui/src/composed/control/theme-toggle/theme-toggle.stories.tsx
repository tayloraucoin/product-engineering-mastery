import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { ThemeProvider } from "../../../providers/theme/theme-provider";
import { THEME_TOGGLE_COPY } from "./copy";
import { ThemeToggle } from "./theme-toggle";

const { options } = THEME_TOGGLE_COPY;

/** The toggle drives the real `.dark` class, so the toolbar's is off. */
const meta = {
  title: "Composed/Control/Theme toggle",
  component: ThemeToggle,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: { themes: { disable: true } },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No stored choice: "system", the provider's default, is selected. */
export const System: Story = {
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
    await expect(
      canvas.getByRole("radio", { name: options.system }),
    ).toHaveFocus();
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
