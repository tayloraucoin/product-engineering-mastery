import { expect, test, type Locator, type Page } from "@playwright/test";

const HALVORSEN = "rec_4a1d";
const EDIT = `/demo/records/${HALVORSEN}/edit`;
const FIRST_NEW_ID = "rec_a000";

/** Client navigation keeps the visit's store; page.goto would reset it (D-DEMO-7). */
async function clientGo(page: Page, href: string) {
  await page.evaluate((to) => {
    (
      window as unknown as { next: { router: { push(h: string): void } } }
    ).next.router.push(to);
  }, href);
  await page.waitForURL(`**${href}`);
}

function save(page: Page) {
  return page.getByRole("button", { name: /^(Save|Retry save)$/ });
}

/** A held Save is aria-disabled, which Playwright will not click; a keyboard press still reaches it. */
async function pressHeld(page: Page, button: Locator) {
  await button.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
}

async function fillValid(page: Page) {
  await page.getByLabel("Vendor name").fill("Northwind Couriers");
  await page.getByLabel("Owner").selectOption({ label: "Priya Nair" });
  await page.getByLabel("Annual value (USD)").fill("12500");
}

test("C2: Save on an empty new form focuses the summary, shows three field errors and keeps input", async ({
  page,
}) => {
  await page.goto("/demo/records/new");
  await page.getByLabel("Status").selectOption({ label: "Active" });
  await page.getByLabel("Terms").fill("Payment is due within 30 days.");
  await save(page).click();

  const summary = page.getByRole("alert").filter({
    hasText: "3 fields need a change before saving",
  });
  await expect(summary).toBeFocused();
  await expect(summary).toContainText(
    "Vendor name, Owner and Annual value. Nothing you entered is lost.",
  );
  await expect(page.getByText("Enter the vendor's name.")).toBeVisible();
  await expect(page.getByText("Choose an owner.")).toBeVisible();
  await expect(page.getByText("Enter a value of 0 or more.")).toBeVisible();
  await expect(page.getByLabel("Vendor name")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.getByLabel("Vendor name")).toHaveAccessibleDescription(
    "Enter the vendor's name.",
  );
  await expect(page.getByLabel("Status")).toHaveValue("active");
  await expect(page.getByLabel("Terms")).toHaveValue(
    "Payment is due within 30 days.",
  );

  // A named field in the summary moves focus to its control.
  await summary.getByRole("link", { name: "Owner" }).click();
  await expect(page.getByLabel("Owner")).toBeFocused();
});

test("C3: correcting an erred field clears its error without another submit", async ({
  page,
}) => {
  await page.goto("/demo/records/new");
  // Before a submit nothing validates live.
  await page.getByLabel("Annual value (USD)").fill("-1");
  await expect(page.getByText("Enter a value of 0 or more.")).toHaveCount(0);

  await save(page).click();
  await expect(page.getByText("Enter a value of 0 or more.")).toBeVisible();
  await page.getByLabel("Annual value (USD)").fill("0");
  await expect(page.getByText("Enter a value of 0 or more.")).toHaveCount(0);
  await page.getByLabel("Vendor name").fill("Northwind Couriers");
  await expect(page.getByText("Enter the vendor's name.")).toHaveCount(0);
  await expect(page.getByRole("alert").first()).toContainText(
    "1 field needs a change before saving",
  );
});

test("C4: pressing Save twice quickly makes one save", async ({ page }) => {
  await page.goto("/demo/records/new");
  await fillValid(page);
  // Two presses inside one task, before the write resolves.
  await save(page).evaluate((button: HTMLButtonElement) => {
    button.click();
    button.click();
  });
  await page.waitForURL(`**/demo/records/${FIRST_NEW_ID}?state=saved`);

  // A second save would have taken the next free id.
  await clientGo(page, `/demo/records/${FIRST_NEW_ID}/edit`);
  await expect(page.getByLabel("Vendor name")).toHaveValue(
    "Northwind Couriers",
  );
  await clientGo(page, "/demo/records/rec_a001/edit");
  await expect(
    page.getByRole("heading", { name: "No record with this link" }),
  ).toBeVisible();
});

test("C4: while saving, the form is busy and Save is held at its width", async ({
  page,
}) => {
  await page.goto(`${EDIT}?state=submitting`);
  await expect(page.locator("form")).toHaveAttribute("aria-busy", "true");
  const saving = page.getByRole("button", { name: "Saving" });
  await expect(saving).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByRole("button", { name: "Cancel" })).toBeDisabled();
  await expect(page.getByLabel("Vendor name")).toHaveAttribute("readonly", "");
  await pressHeld(page, saving);
  await expect(page).toHaveURL(`${EDIT}?state=submitting`);
});

test("C5: a valid save opens the record's detail with ?state=saved", async ({
  page,
}) => {
  await page.goto(EDIT);
  await page.getByLabel("Annual value (USD)").fill("52000");
  await save(page).click();
  await page.waitForURL(`**/demo/records/${HALVORSEN}?state=saved`);

  await clientGo(page, EDIT);
  await expect(page.getByLabel("Annual value (USD)")).toHaveValue("52,000");
});

test("C5: a new record saves and opens its detail", async ({ page }) => {
  await page.goto("/demo/records/new");
  await fillValid(page);
  await page
    .getByLabel("Terms")
    .fill(
      "Payment is due within 30 days.\n\n  Either party may end with notice.  ",
    );
  await save(page).click();
  await page.waitForURL(`**/demo/records/${FIRST_NEW_ID}?state=saved`);
  await clientGo(page, `/demo/records/${FIRST_NEW_ID}/edit`);
  await expect(page.getByLabel("Terms")).toHaveValue(
    "Payment is due within 30 days.\nEither party may end with notice.",
  );
});

test("C6: leaving with changes asks first; Keep editing returns and Discard change leaves", async ({
  page,
}) => {
  await page.goto(EDIT);
  await page.getByLabel("Annual value (USD)").fill("52000");

  // Cancel.
  await page.getByRole("button", { name: "Cancel" }).click();
  const dialog = page.getByRole("alertdialog", {
    name: "Leave without saving?",
  });
  await expect(dialog).toContainText(
    "You changed Annual value. Leaving discards that change.",
  );
  await expect(
    dialog.getByRole("button", { name: "Keep editing" }),
  ).toBeFocused();
  await dialog.getByRole("button", { name: "Keep editing" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByLabel("Annual value (USD)")).toHaveValue("52,000");

  // The nav, and Escape keeps editing.
  await page
    .getByRole("navigation", { name: "Demo" })
    .getByRole("link", { name: "Settings" })
    .click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(EDIT);

  // The breadcrumb, then Discard change follows it.
  await page
    .getByLabel("breadcrumb")
    .getByRole("link", { name: "Records" })
    .click();
  await dialog.getByRole("button", { name: "Discard change" }).click();
  await page.waitForURL("**/demo/records");
});

test("C6: an unchanged form leaves without asking", async ({ page }) => {
  await page.goto(EDIT);
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.waitForURL(`**/demo/records/${HALVORSEN}`);
});

test("C7: on partial Save is held and described by the notice", async ({
  page,
}) => {
  await page.goto(`${EDIT}?state=partial`);
  await expect(save(page)).toHaveAttribute("aria-disabled", "true");
  await expect(save(page)).toHaveAccessibleDescription(
    /Owner and Status did not load.*Save is held until they load/,
  );
  await expect(page.getByLabel("Owner")).toBeDisabled();
  await expect(page.getByLabel("Owner")).toHaveAccessibleDescription(
    /did not load/,
  );
  await expect(page.getByLabel("Status")).toBeDisabled();
  await pressHeld(page, save(page));
  await expect(page).toHaveURL(`${EDIT}?state=partial`);

  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByLabel("Owner")).toBeEnabled();
  await expect(save(page)).not.toHaveAttribute("aria-disabled", "true");
});

test("C7: offline keeps input editable and holds Save", async ({ page }) => {
  await page.goto(`${EDIT}?state=offline`);
  await expect(save(page)).toHaveAttribute("aria-disabled", "true");
  await expect(save(page)).toHaveAccessibleDescription(/You are offline/);
  await page.getByLabel("Vendor name").fill("Halvorsen Freight AS");
  await expect(page.getByLabel("Vendor name")).toHaveValue(
    "Halvorsen Freight AS",
  );
  await pressHeld(page, save(page));
  await expect(page).toHaveURL(`${EDIT}?state=offline`);
  await expect(page.getByLabel("Vendor name")).toHaveValue(
    "Halvorsen Freight AS",
  );
});
