import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "./questionnaire";

type Args = { shortcuts?: "letters" | "numbers" };

const items = [
  {
    name: "team",
    required: true,
    choices: [{ value: "solo" }, { value: "small" }, { value: "large" }],
  },
  { name: "goal", choices: [{ value: "ship" }, { value: "learn" }] },
] as const;

const meta = {
  title: "Primitives/Control/Questionnaire",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/questionnaire.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "the shortcut key's 0.625rem on text-xs",
    },
  },
  render: ({ shortcuts }: Args) => (
    <Questionnaire
      className="max-w-md"
      defaultItem="team"
      items={items}
      shortcuts={shortcuts}
      onSubmit={(event) => event.preventDefault()}
    >
      <QuestionnaireProgress />
      <QuestionnaireItem name="team" required>
        <QuestionnaireTitle>How big is your team?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="solo">Just me</QuestionnaireChoice>
          <QuestionnaireChoice value="small">
            2 to 10
            <QuestionnaireChoiceDescription>
              Most teams start here
            </QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="large">More than 10</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem name="goal" multiple>
        <QuestionnaireTitle>
          What do you want from the trial?
        </QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="ship">
            Ship a first project
          </QuestionnaireChoice>
          <QuestionnaireChoice value="learn">
            Learn the tools
          </QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireNext>Next</QuestionnaireNext>
        <QuestionnaireSubmit>Save answers</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstQuestion: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("How big is your team?")).toBeInTheDocument();
    await expect(
      canvas.getByRole("radio", { name: /Just me/ }),
    ).not.toBeChecked();
  },
};

export const WithShortcuts: Story = { args: { shortcuts: "letters" } };

/** Choosing an answer checks it. */
export const Choose: Story = {
  play: async ({ canvas }) => {
    const choice = canvas.getByRole("radio", { name: /2 to 10/ });
    await userEvent.click(choice);
    await expect(choice).toBeChecked();
  },
};

/** Next after an answer moves to the second question. */
export const Advance: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("radio", { name: /Just me/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await waitFor(() =>
      expect(
        canvas.getByText("What do you want from the trial?"),
      ).toBeVisible(),
    );
  },
};
