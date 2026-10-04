import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

import { brand } from "@pem/brand/brand";

/** The workshop's own chrome carries the brand: its name, logo and home link. */
addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: brand.name,
    brandUrl: brand.urls.home,
    brandImage: `/brand/${brand.assets.logo.replace(/^assets\//, "")}`,
    brandTarget: "_self",
  }),
});
