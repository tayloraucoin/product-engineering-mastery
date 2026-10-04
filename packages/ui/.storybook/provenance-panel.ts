import { createElement as h } from "react";
import { AddonPanel } from "storybook/internal/components";
import {
  addons,
  types,
  useParameter,
  useStorybookApi,
  useStorybookState,
} from "storybook/manager-api";
import { styled } from "storybook/theming";

/**
 * The Provenance panel (CAT-3, D-CAT-6): where the selected story's component
 * came from, beside Controls and Accessibility. It reads the story's own
 * `parameters.provenance` and its `source:`, `verdict:` and `layer:` tags,
 * which check-catalog holds to packages/catalog/manifest.json. It lives in
 * the manager, so the canvas and its axe pass see only the component.
 */

export type Provenance = {
  upstream: string;
  licence: string;
  adapted?: string;
};

const ADDON = "pem/provenance";

const List = styled.dl(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "max-content 1fr",
  gap: "8px 16px",
  margin: 0,
  padding: 16,
  color: theme.color.defaultText,
  fontSize: theme.typography.size.s2,
  "& dt": { fontWeight: theme.typography.weight.bold },
  "& dd": { margin: 0, wordBreak: "break-word" },
}));

const tagValue = (tags: string[], prefix: string) =>
  tags.find((tag) => tag.startsWith(`${prefix}:`))?.slice(prefix.length + 1) ??
  "not tagged";

function ProvenanceList() {
  useStorybookState();
  const story = useStorybookApi().getCurrentStoryData();
  const provenance = useParameter<Provenance | undefined>("provenance");
  const tags = story?.tags ?? [];
  const rows: [string, string][] = [
    ["Source", tagValue(tags, "source")],
    ["Verdict", tagValue(tags, "verdict")],
    ["Layer", tagValue(tags, "layer")],
    ["Upstream", provenance?.upstream ?? "not recorded"],
    ["Licence", provenance?.licence ?? "not recorded"],
    ["Adapted", provenance?.adapted ?? "as upstream"],
  ];
  return h(
    List,
    null,
    rows.flatMap(([term, value]) => [
      h("dt", { key: `${term}-t` }, term),
      h("dd", { key: `${term}-d` }, value),
    ]),
  );
}

export function registerProvenancePanel() {
  addons.register(ADDON, () => {
    addons.add(`${ADDON}/panel`, {
      type: types.PANEL,
      title: "Provenance",
      render: ({ active }) =>
        h(AddonPanel, { active: Boolean(active) }, h(ProvenanceList)),
    });
  });
}
