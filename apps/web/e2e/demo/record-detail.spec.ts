import { expect, test, type Page } from "@playwright/test";

const HALVORSEN = "/demo/records/rec_4a1d";

const compareButton = (page: Page) =>
  page.getByRole("button", { name: "Compare", exact: true });

test("C1: Compare shows version 4 against 3, sets ?view=compare, Current returns", async ({
  page,
}) => {
  await page.goto(HALVORSEN);
  await compareButton(page).click();
  await expect(page.getByText("2 clauses changed, 1 added")).toBeVisible();
  await expect(
    page.getByText("Version 4 (current) compared with version 3"),
  ).toBeVisible();
  await expect(page).toHaveURL(/\?view=compare/);

  await page.getByRole("button", { name: "Current", exact: true }).click();
  await expect(page.getByText("2 clauses changed, 1 added")).toHaveCount(0);
  await expect(
    page.getByText("Version 4, current since 5 Oct 2026"),
  ).toBeVisible();
  await expect(page).not.toHaveURL(/view=compare/);
});

test("C2: diff rows are del and ins with labels in their names and hidden glyphs", async ({
  page,
}) => {
  await page.goto(`${HALVORSEN}?state=diff`);
  const removed = page.locator("del");
  const added = page.locator("ins");
  await expect(removed).toHaveCount(2);
  await expect(added).toHaveCount(3);
  for (const el of await removed.all())
    await expect(el).toContainText("Removed:");
  for (const el of await added.all()) await expect(el).toContainText("Added:");
  const glyphs = page.locator('li[data-kind] > span[aria-hidden="true"]');
  expect(await glyphs.count()).toBeGreaterThan(0);
});

for (const key of ["no-history", "partial"]) {
  test(`C3: on ${key} Compare is aria-disabled and described by the subtitle`, async ({
    page,
  }) => {
    await page.goto(`${HALVORSEN}?state=${key}`);
    const compare = compareButton(page);
    await expect(compare).toHaveAttribute("aria-disabled", "true");
    const describedBy = await compare.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const subtitle = page.locator(`#${describedBy}`);
    await expect(subtitle).toContainText(/Compare needs/);
    await compare.click({ force: true });
    await expect(page).not.toHaveURL(/view=compare/);
  });
}

test("C4: Halvorsen history lists versions 4, 3, 2, 1 with their summaries", async ({
  page,
}) => {
  await page.goto(HALVORSEN);
  const history = page.getByRole("region", { name: "History" });
  await expect(history).toContainText("Version 4");
  const text = (await history.innerText()).replace(/\s+/g, " ");
  const order = [
    "Version 4 Payment to 45 days, notice to 60 days, fuel surcharge added 5 Oct 2026, Ana Okafor",
    "Version 3 Liability cap set to annual value 12 Aug 2026, Tomas Reyes",
    "Version 2 Services limited to the two depots 3 Feb 2026, Tomas Reyes",
    "Version 1 First version of the terms 14 Mar 2025, Ana Okafor",
  ];
  let from = 0;
  for (const row of order) {
    const at = text.indexOf(row, from);
    expect(at, row).toBeGreaterThanOrEqual(from);
    from = at + row.length;
  }
});

test("C5: offline makes Edit and Delete aria-disabled, described by the notice", async ({
  page,
}) => {
  await page.goto(`${HALVORSEN}?state=offline`);
  for (const name of ["Edit", "Delete"]) {
    const control = page.getByRole("button", { name, exact: true });
    await expect(control).toHaveAttribute("aria-disabled", "true");
    const describedBy = await control.getAttribute("aria-describedby");
    await expect(page.locator(`#${describedBy}`)).toContainText(
      "You are offline",
    );
  }
  await page
    .getByRole("button", { name: "Delete", exact: true })
    .click({ force: true });
  await expect(page).not.toHaveURL(/dialog=delete/);
});

test("C6: Edit opens the edit route, Delete adds a history entry, an unknown id is not found with a 200", async ({
  page,
}) => {
  await page.goto(HALVORSEN);
  await page.getByRole("link", { name: "Edit", exact: true }).click();
  await expect(page).toHaveURL(/\/demo\/records\/rec_4a1d\/edit$/);

  await page.goto(HALVORSEN);
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page).toHaveURL(/\?dialog=delete$/);
  await page.goBack();
  await expect(page).toHaveURL(/rec_4a1d$/);

  const response = await page.goto("/demo/records/rec_0000");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "No record with this link" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }),
  ).toContainText("Not found");
});
