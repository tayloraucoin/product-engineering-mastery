import { useTheme } from "next-themes";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";

import { ThemeProvider } from "./theme-provider";

/** What the provider resolved, painted on the semantic surface tokens. */
function ResolvedTheme() {
  const { theme, resolvedTheme } = useTheme();
  return (
    <p className="rounded-md border border-border bg-background p-4 text-sm text-foreground">
      Chosen: {theme ?? "…"} · painted: {resolvedTheme ?? "…"}
    </p>
  );
}

/** The provider owns the `.dark` class here, so the toolbar's is off. */
const meta = {
  title: "Providers/Theme",
  component: ThemeProvider,
  args: { children: <ResolvedTheme /> },
  parameters: { themes: { disable: true } },
} satisfies Meta<typeof ThemeProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No stored choice: the operating system decides. */
export const System: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/Chosen: system/)).toBeVisible();
  },
};

export const Light: Story = {
  parameters: { storedTheme: "light" },
  play: async () => {
    await waitFor(() => expect(document.documentElement).toHaveClass("light"));
    await expect(document.documentElement).not.toHaveClass("dark");
  },
};

export const Dark: Story = {
  parameters: { storedTheme: "dark" },
  play: async () => {
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
  },
};
