import { withThemeByClassName } from "@storybook/addon-themes";
import type { Decorator, Preview } from "@storybook/nextjs-vite";

import { brandSans } from "@pem/brand/font";
import type { Theme } from "@pem/ui/theme";

import "./preview.css";

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
const withToolbarTheme: Decorator = (Story, context) => {
  const { disable, themeOverride } = context.parameters.themes ?? {};
  if (disable) return <Story />;
  // Set before the story paints, as next-themes does in the app. The addon's
  // own effect lands after paint, and axe would scan a colour transition.
  document.documentElement.classList.toggle(
    "dark",
    (themeOverride ?? context.globals.theme) === "dark",
  );
  return withThemeClass(Story, context);
};

/** The brand font's variable on <html>, as each app's root layout puts it. */
const withBrandFont: Decorator = (Story) => {
  document.documentElement.classList.add(brandSans.variable);
  return <Story />;
};

/**
 * Every story renders the way the app does: the preset's tokens, the brand
 * font on <html>, and the `.dark` class from the toolbar. Interaction (`play`)
 * and accessibility (axe, as errors) checks run per story in the workshop and
 * in `yarn test` (stories.test.ts).
 */
const preview: Preview = {
  /**
   * `parameters.storedTheme` is the theme a person chose earlier, put where
   * next-themes reads it before the story mounts; `null` is no choice yet.
   * Only these stories use the key here, so whatever the story stored (a
   * click on the toggle) is cleared after, with the class it set.
   */
  beforeEach: ({ parameters }) => {
    const stored = parameters.storedTheme as Theme | null | undefined;
    if (stored === undefined) return;
    if (stored === null) localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, stored);
    return () => {
      localStorage.removeItem(THEME_KEY);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.style.removeProperty("color-scheme");
    };
  },
  decorators: [withToolbarTheme, withBrandFont],
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
  },
};

export default preview;
