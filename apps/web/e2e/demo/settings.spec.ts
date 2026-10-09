import { expect, test, type Page } from "@playwright/test";

const SETTINGS = "/demo/settings";

/** `?state=` keeps the cookie of a fresh context empty, so every test starts at the defaults. */
async function prefsCookie(page: Page) {
  const cookies = await page.context().cookies();
  const raw = cookies.find((c) => c.name === "pem_demo_prefs")?.value;
  return raw ? JSON.parse(decodeURIComponent(raw)) : null;
}

const toastTitle = (page: Page, title: string) =>
  page.locator('[data-slot="toast-title"]', { hasText: title });

test("C1: theme, compact rows and default sort apply at once, a toast names each, and they survive a reload", async ({
  page,
}) => {
  await page.goto(SETTINGS);
  const theme = page.getByRole("group", { name: "Theme" });

  await theme.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(toastTitle(page, "Theme saved")).toBeVisible();
  await expect(page.getByText("Dark is on.")).toBeVisible();

  await page.getByRole("switch", { name: "Compact rows" }).click();
  await expect(
    page.getByRole("switch", { name: "Compact rows" }),
  ).toBeChecked();
  await expect(toastTitle(page, "Compact rows saved")).toBeVisible();

  const sort = page.getByRole("group", { name: "Default sort" });
  await sort
    .getByRole("radio", { name: "Annual value, highest first" })
    .click();
  await expect(toastTitle(page, "Default sort saved")).toBeVisible();

  // Focus stays on the control that changed.
  await expect(
    sort.getByRole("radio", { name: "Annual value, highest first" }),
  ).toBeFocused();

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(
    page.getByRole("switch", { name: "Compact rows" }),
  ).toBeChecked();
  await expect(
    page
      .getByRole("group", { name: "Default sort" })
      .getByRole("radio", { name: "Annual value, highest first" }),
  ).toBeChecked();
});

test("C1: the settings theme and the shell's toggle are one state", async ({
  page,
}) => {
  await page.goto(SETTINGS);
  await page
    .getByRole("radiogroup", { name: /theme/i })
    .getByRole("radio", { name: /light/i })
    .click();
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(
    page
      .getByRole("group", { name: "Theme" })
      .getByRole("button", { name: "Light" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("C2: with Default sort set to renewal date, /demo/records opens sorted by renewal date, soonest first", async ({
  page,
}) => {
  await page.goto(SETTINGS);
  await page
    .getByRole("radio", { name: "Renewal date, soonest first" })
    .click();
  await expect
    .poll(() => prefsCookie(page))
    .toMatchObject({
      defaultSort: "renews-asc",
    });
  await page.goto("/demo/records");
  await expect(
    page.getByRole("columnheader", { name: /Renews/ }),
  ).toHaveAttribute("aria-sort", "ascending");
});

test("C3: Replay onboarding opens /demo/welcome", async ({ page }) => {
  await page.goto(SETTINGS);
  await page.getByRole("button", { name: "Replay onboarding" }).click();
  await expect(page).toHaveURL(/\/demo\/welcome$/);
});

test("C4: Reset data brings the 40 records back and leaves prefs alone; Cancel changes nothing", async ({
  page,
}) => {
  await page.goto(SETTINGS);
  await page.getByRole("switch", { name: "Compact rows" }).click();
  const before = await prefsCookie(page);

  const trigger = page.getByRole("button", { name: "Reset demo data" });
  await trigger.click();
  const dialog = page.getByRole("alertdialog", { name: "Reset demo data?" });
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await prefsCookie(page)).toEqual(before);

  await trigger.click();
  await dialog.getByRole("button", { name: "Reset data" }).click();
  await expect(toastTitle(page, "Demo data reset")).toBeVisible();
  await expect(page.getByText("40 sample records are back.")).toBeVisible();
  expect(await prefsCookie(page)).toEqual(before);

  await page.getByRole("link", { name: "Records" }).click();
  await expect(page.getByTestId("records-count")).toHaveText(/^40 records/);
  // The edit and delete that precede a reset need DEMO-10's form and DEMO-12's
  // dialog; the reducer's reset of them is covered by lib store.test.ts.
  test.info().annotations.push({
    type: "pending",
    description: "edit and delete before reset wait for DEMO-10 and DEMO-12",
  });
});

test("C4: ?state=reset opens the confirm", async ({ page }) => {
  await page.goto(`${SETTINGS}?state=reset`);
  await expect(
    page.getByRole("alertdialog", { name: "Reset demo data?" }),
  ).toBeVisible();
});

test("C5: offline keeps Theme and Replay working and disables the rest, described by the notice", async ({
  page,
}) => {
  await page.goto(`${SETTINGS}?state=offline`);
  const notice = page.getByRole("alert").filter({ hasText: "You are offline" });
  await expect(notice).toBeVisible();
  const noticeId = await notice.getAttribute("id");

  const compact = page.getByRole("switch", { name: "Compact rows" });
  const reset = page.getByRole("button", { name: "Reset demo data" });
  const radios = page
    .getByRole("group", { name: "Default sort" })
    .getByRole("radio");
  await expect(compact).toBeDisabled();
  await expect(reset).toBeDisabled();
  await expect(radios).toHaveCount(3);
  for (const radio of await radios.all()) await expect(radio).toBeDisabled();
  await expect(compact).toHaveAttribute(
    "aria-describedby",
    new RegExp(noticeId!),
  );
  await expect(reset).toHaveAttribute(
    "aria-describedby",
    new RegExp(noticeId!),
  );

  await page
    .getByRole("group", { name: "Theme" })
    .getByRole("button", { name: "Dark" })
    .click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(
    page.getByRole("button", { name: "Replay onboarding" }),
  ).toBeEnabled();
});

test("C6: error shows the previous sort and Retry saves the change", async ({
  page,
}) => {
  await page.goto(`${SETTINGS}?state=error`);
  const sort = page.getByRole("group", { name: "Default sort" });
  await expect(
    sort.getByRole("radio", { name: "Vendor name, A to Z" }),
  ).toBeChecked();
  const alert = page.getByRole("alert").filter({ hasText: "did not save" });
  await expect(alert).toContainText("It is back to Vendor name, A to Z.");

  await alert.getByRole("button", { name: "Retry" }).click();
  await expect(
    sort.getByRole("radio", { name: "Renewal date, soonest first" }),
  ).toBeChecked();
  await expect(alert).toBeHidden();
  await expect
    .poll(() => prefsCookie(page))
    .toMatchObject({
      defaultSort: "renews-asc",
    });
});

test("C6: partial replaces the Records group with an alert and Retry brings it back", async ({
  page,
}) => {
  await page.goto(`${SETTINGS}?state=partial`);
  await expect(page.getByRole("group", { name: "Default sort" })).toHaveCount(
    0,
  );
  await expect(page.getByText("Records settings did not load")).toBeVisible();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(
    page.getByRole("group", { name: "Default sort" }).getByRole("radio"),
  ).toHaveCount(3);
});

test("every key renders its state marker", async ({ page }) => {
  for (const key of [
    "saved",
    "empty",
    "loading",
    "error",
    "partial",
    "offline",
    "reset",
  ]) {
    const response = await page.goto(`${SETTINGS}?state=${key}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("[data-demo-state]").first()).toHaveAttribute(
      "data-demo-state",
      key,
    );
  }
});
