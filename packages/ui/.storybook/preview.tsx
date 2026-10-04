import { withThemeByClassName } from "@storybook/addon-themes";
import type { Decorator, Preview } from "@storybook/nextjs-vite";

import { brandSans } from "@pem/brand/font";
import type { Theme } from "@pem/ui/theme";

import "./preview.css";

/**
 * Every story renders the way the app does: the preset's tokens, the brand
 * font on <html>, and the `.dark` class from the toolbar. Interaction (`play`)
 * and accessibility (axe, as errors) checks run per story in the workshop and
 * in `yarn test` (stories.test.ts).
 */
/** next-themes' storage key, which `ThemeProvider` leaves at its default. */
const THEME_KEY = "theme";

const withThemeClass = withThemeByClassName({
  themes: { light: "", dark: "dark" },
  defaultTheme: "light",
  parentSelector: "html",
});

/**
 * The toolbar's `.dark` class, unless the story turns it off with
 * `themes: { disable: true }` because a `ThemeProvider` in it owns the class.
 */
const withToolbarTheme: Decorator = (Story, context) =>
  context.parameters.themes?.disable ? (
    <Story />
  ) : (
    withThemeClass(Story, context)
  );

const preview: Preview = {
  /**
   * `parameters.storedTheme` is the theme a person chose earlier, put where
   * next-themes reads it before the story mounts, and taken back after.
   */
  beforeEach: ({ parameters }) => {
    const stored = parameters.storedTheme as Theme | undefined;
    if (!stored) return;
    const previous = localStorage.getItem(THEME_KEY);
    localStorage.setItem(THEME_KEY, stored);
    return () => {
      if (previous === null) localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, previous);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.style.removeProperty("color-scheme");
    };
  },
  decorators: [
    withToolbarTheme,
    (Story) => {
      document.documentElement.classList.add(brandSans.variable);
      return <Story />;
    },
  ],
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
  },
};

export default preview;
