/** The themes a person can choose; "system" follows the operating system. */
export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];
