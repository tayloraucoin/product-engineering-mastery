import type { Meta, StoryObj } from "@storybook/nextjs-vite";

/** Fixture: a button with no accessible name, which axe must fail. */
function Unnamed() {
  return <button type="button" />;
}

const meta = {
  title: "Fixtures/A11y violation",
  component: Unnamed,
} satisfies Meta<typeof Unnamed>;

export default meta;

export const UnnamedButton: StoryObj<typeof meta> = {};
