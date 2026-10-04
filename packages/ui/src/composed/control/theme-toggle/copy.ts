import type { Theme } from "../../../providers/theme/themes";

/** The theme toggle's strings: the group's accessible name and one label per option. */
export const THEME_TOGGLE_COPY = {
  label: "Theme",
  options: {
    light: "Light",
    dark: "Dark",
    system: "System",
  } satisfies Record<Theme, string>,
} as const;
