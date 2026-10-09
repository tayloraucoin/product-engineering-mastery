import { expect, test, type Page } from "@playwright/test";

const KEYS = [
  "beat-1",
  "beat-2",
  "beat-3",
  "empty",
  "loading",
  "error",
  "partial",
  "offline",
] as const;
const SKIP_SHOWN = new Set([
  "beat-1",
  "beat-2",
  "loading",
  "partial",
  "offline",
]);
const ILLUSTRATED = [
  "beat-1",
  "beat-2",
  "beat-3",
  "empty",
  "offline",
  "loading",
];

async function onboarded(page: Page): Promise<boolean> {
  const cookie = (await page.context().cookies()).find(
    (c) => c.name === "pem_demo_prefs",
  );
  return cookie
    ? JSON.parse(decodeURIComponent(cookie.value)).onboarded === true
    : false;
}

test("C1: a first visit goes to the welcome; after skip or finish, /demo goes to the records", async ({
  page,
  browser,
}) => {
  await page.goto("/demo");
  await expect(page).toHaveURL(/\/demo\/welcome$/);
  await page.getByRole("button", { name: "Skip to records" }).click();
  await expect(page).toHaveURL(/\/demo\/records$/);
  await page.goto("/demo");
  await expect(page).toHaveURL(/\/demo\/records$/);

  const fresh = await browser.newPage();
  await fresh.goto("/demo");
  await expect(fresh).toHaveURL(/\/demo\/welcome$/);
  await fresh.getByRole("button", { name: "Next" }).click();
  await expect(fresh).toHaveURL(/state=beat-2/);
  await fresh.getByRole("button", { name: "Next" }).click();
  await expect(fresh).toHaveURL(/state=beat-3/);
  await fresh.getByRole("button", { name: "Go to records" }).click();
  await expect(fresh).toHaveURL(/\/demo\/records$/);
  await fresh.goto("/demo");
  await expect(fresh).toHaveURL(/\/demo\/records$/);
  await fresh.close();
});

test("C2: Next on beats 1 and 2 shows the next beat, focuses its h1 and adds no history", async ({
  page,
}) => {
  await page.goto("/demo/welcome");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveText("Every record is a vendor contract");
  await expect(h1).toBeFocused();
  const before = await page.evaluate(() => history.length);

  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(/state=beat-2/);
  await expect(h1).toHaveText("Find one, read what changed");
  await expect(h1).toBeFocused();

  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(/state=beat-3/);
  await expect(h1).toHaveText("Change it safely");
  await expect(h1).toBeFocused();

  expect(await page.evaluate(() => history.length)).toBe(before);
});

test("C3: Skip, or Go to records, opens the records and a later /demo skips the welcome", async ({
  browser,
}) => {
  for (const [path, name] of [
    ["/demo/welcome", "Skip to records"],
    ["/demo/welcome?state=beat-3", "Go to records"],
  ] as const) {
    const page = await browser.newPage();
    await page.goto(path);
    expect(await onboarded(page)).toBe(false);
    await page.getByRole("button", { name }).click();
    await expect(page).toHaveURL(/\/demo\/records$/);
    expect(await onboarded(page)).toBe(true);
    await page.goto("/demo");
    await expect(page).toHaveURL(/\/demo\/records$/);
    await page.close();
  }
});

test("C4: Skip shows on beat-1, beat-2, loading, partial and offline, and nowhere else", async ({
  page,
}) => {
  for (const key of KEYS) {
    await page.goto(`/demo/welcome?state=${key}`);
    await expect(page.locator(`[data-demo-state="${key}"]`)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Skip to records" }),
      key,
    ).toHaveCount(SKIP_SHOWN.has(key) ? 1 : 0);
  }
});

test("C5: on every beat the illustration is aria-hidden, inert and never takes focus", async ({
  page,
}) => {
  for (const key of ILLUSTRATED) {
    await page.goto(`/demo/welcome?state=${key}`);
    const slot = page.locator('[data-slot="onboarding-illustration"]');
    await expect(slot, key).toHaveAttribute("aria-hidden", "true");
    expect(await slot.evaluate((el) => (el as HTMLElement).inert), key).toBe(
      true,
    );
    // Walk the whole tab order: focus never lands inside the slot.
    const stops = await page.locator("button, a[href]").count();
    for (let i = 0; i < stops + 2; i++) {
      await page.keyboard.press("Tab");
      expect(
        await slot.evaluate((el) => el.contains(document.activeElement)),
        `${key} tab ${i}`,
      ).toBe(false);
    }
  }
});

test("C6: New record on empty opens /demo/records/new", async ({ page }) => {
  await page.goto("/demo/welcome?state=empty");
  await page.getByRole("button", { name: "New record" }).click();
  await expect(page).toHaveURL(/\/demo\/records\/new$/);
  expect(await onboarded(page)).toBe(true);
});
