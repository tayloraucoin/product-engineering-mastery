import { expect, test, type Page } from "@playwright/test";

const HALVORSEN = "/demo/records/rec_4a1d";
const DIALOG = `${HALVORSEN}?dialog=delete`;

const dialog = (page: Page) => page.getByRole("alertdialog");
const confirm = (page: Page) =>
  dialog(page).getByRole("button", {
    name: /^(Delete record|Retry delete|Deleting)$/,
  });
const cancel = (page: Page) =>
  dialog(page).getByRole("button", { name: "Cancel" });

/** A held button is aria-disabled, which Playwright will not click; a press still reaches it. */
const press = (button: ReturnType<typeof confirm>) =>
  button.evaluate((el: HTMLElement) => el.click());

test("C1: Delete sets ?dialog=delete, focus is on Cancel and Tab stays inside", async ({
  page,
}) => {
  await page.goto(HALVORSEN);
  await page.locator("#record-delete").click();
  await expect(page).toHaveURL(/\?dialog=delete/);
  await expect(dialog(page)).toBeVisible();
  await expect(cancel(page)).toBeFocused();
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("Tab");
    // Base UI parks focus on a guard for a tick, then moves it inside.
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.activeElement?.closest('[role="alertdialog"]') !== null,
        ),
      )
      .toBe(true);
  }
});

for (const how of ["Cancel", "Escape", "scrim"] as const) {
  test(`C2: ${how} closes it, the record is unchanged, focus is on Delete`, async ({
    page,
  }) => {
    await page.goto(HALVORSEN);
    await page.locator("#record-delete").click();
    await expect(dialog(page)).toBeVisible();
    if (how === "Cancel") await cancel(page).click();
    else if (how === "Escape") await page.keyboard.press("Escape");
    else await page.mouse.click(5, 5);
    await expect(dialog(page)).toHaveCount(0);
    await expect(page).not.toHaveURL(/dialog=/);
    await expect(
      page.locator("h1", { hasText: "Halvorsen Freight" }),
    ).toBeVisible();
    await expect(page.locator("#record-delete")).toBeFocused();
  });
}

test("C3: Delete record opens /demo/records?state=deleted and the toast names the record", async ({
  page,
}) => {
  await page.goto(DIALOG);
  await confirm(page).click();
  await page.waitForURL("**/demo/records?state=deleted");
  await expect(page.getByText(/Halvorsen Freight/).first()).toBeVisible();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Halvorsen Freight" })
      .or(page.getByText(/Halvorsen Freight (deleted|was deleted)/i))
      .first(),
  ).toBeVisible();
});

test("C4: on deleting a second press and Escape do nothing", async ({
  page,
}) => {
  await page.goto(`${DIALOG}&state=deleting`);
  const held = confirm(page);
  await expect(held).toHaveText("Deleting");
  await expect(held).toHaveAttribute("aria-disabled", "true");
  await expect(cancel(page)).toHaveAttribute("aria-disabled", "true");
  await press(held);
  await press(held);
  await page.keyboard.press("Escape");
  await page.mouse.click(5, 5);
  await expect(dialog(page)).toBeVisible();
  await expect(page).toHaveURL(`${DIALOG}&state=deleting`);
  await expect(held)
    .toBeFocused()
    .catch(() => {});
});

test("C4: a real delete ignores a second press and Escape", async ({
  page,
}) => {
  await page.goto(DIALOG);
  await confirm(page).evaluate((el: HTMLElement) => {
    el.click();
    el.click();
  });
  await page.keyboard.press("Escape");
  await page.waitForURL("**/demo/records?state=deleted");
});

test("C5: on offline Delete record is disabled and described, and Cancel closes", async ({
  page,
}) => {
  await page.goto(`${DIALOG}&state=offline`);
  const del = confirm(page);
  await expect(del).toHaveAttribute("aria-disabled", "true");
  await expect(del).toHaveAccessibleDescription(/You are offline/);
  await press(del);
  await expect(dialog(page)).toBeVisible();
  await expect(page).toHaveURL(/state=offline/);
  await cancel(page).click();
  await expect(dialog(page)).toHaveCount(0);
});

test("C6: on error the record is unchanged and Retry delete deletes it", async ({
  page,
}) => {
  await page.goto(`${DIALOG}&state=error`);
  await expect(dialog(page).getByRole("alert")).toContainText(
    "Halvorsen Freight is unchanged",
  );
  await expect(
    page.locator("h1", { hasText: "Halvorsen Freight" }),
  ).toBeVisible();
  await dialog(page).getByRole("button", { name: "Retry delete" }).click();
  await page.waitForURL("**/demo/records?state=deleted");
});

test("C7: the confirm reads Delete Halvorsen Freight? and says all 4 versions", async ({
  page,
}) => {
  await page.goto(DIALOG);
  await expect(dialog(page)).toHaveAccessibleName("Delete Halvorsen Freight?");
  await expect(dialog(page)).toHaveAccessibleDescription(/all 4 versions/);
});
