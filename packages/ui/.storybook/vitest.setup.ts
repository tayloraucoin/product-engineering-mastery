import * as a11yAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/nextjs-vite";
import { beforeAll } from "vitest";

import * as previewAnnotations from "./preview";

/** jsdom has no matchMedia; next-themes reads it for "system". Light here. */
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) satisfies MediaQueryList;

/** jsdom has no canvas either; axe probes one for colour checks and copes without. */
HTMLCanvasElement.prototype.getContext = () => null;

/** jsdom has no layout, so no elementFromPoint; input-otp probes it for password-manager badges. */
document.elementFromPoint ??= () => null;

/** jsdom runs no animations; Base UI awaits an element's before it unmounts or measures. */
Element.prototype.getAnimations ??= () => [];

/** jsdom has no ResizeObserver; react-resizable-panels observes its group with one. */
window.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const project = setProjectAnnotations([a11yAnnotations, previewAnnotations]);

beforeAll(project.beforeAll);
