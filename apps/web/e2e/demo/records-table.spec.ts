import { expect, test, type Page } from "@playwright/test";

/** DEMO-8: the records table's journeys, named by criterion (records-table.md). */

const WIDE = { width: 1440, height: 900 };
const NARROW = { width: 390, height: 844 };
const NOT_LOADED = [
  "Halvorsen Freight",
  "Kestrel Cloud Hosting",
  "Pellow Cleaning",
];

const count = (page: Page) => page.getByTestId("records-count");
const table = (page: Page) => page.getByRole("table", { name: "Records" });
const bodyRows = (page: Page) => table(page).locator("tbody tr");
const listRows = (page: Page) => page.locator("main ul li[data-record-id]");

async function vendorsInTable(page: Page): Promise<string[]> {
  return bodyRows(page).locator("td:first-child").allInnerTexts();
}

test.describe("at 1440", () => {
  test.use({ viewport: WIDE });

  test("C2: a vendor, status or owner filter updates rows, count and URL, and survives a reload", async ({
    page,
  }) => {
    await page.goto("/demo/records");
    await expect(count(page)).toHaveText("40 records");

    await page.getByRole("searchbox", { name: "Filter by vendor" }).fill("co");
    await expect(page).toHaveURL(/[?&]q=co(&|$)/);
    const byVendor = await vendorsInTable(page);
    expect(byVendor.length).toBeGreaterThan(0);
    expect(byVendor.every((v) => v.toLowerCase().includes("co"))).toBe(true);
    await expect(count(page)).toHaveText(`${byVendor.length} of 40 records`);

    await page.getByRole("combobox", { name: "Status" }).selectOption("active");
    await expect(page).toHaveURL(/[?&]status=active(&|$)/);
    await page
      .getByRole("combobox", { name: "Owner" })
      .selectOption("own_priya");
    await expect(page).toHaveURL(/[?&]owner=own_priya(&|$)/);
    await expect(bodyRows(page).first()).toBeVisible();
    const narrowed = await bodyRows(page).count();
    for (let i = 0; i < narrowed; i++) {
      await expect(bodyRows(page).nth(i)).toContainText("Active");
      await expect(bodyRows(page).nth(i)).toContainText("Priya Nair");
    }
    const words = `${narrowed} of 40 records`;
    await expect(count(page)).toHaveText(words);

    await page.reload();
    await expect(
      page.getByRole("searchbox", { name: "Filter by vendor" }),
    ).toHaveValue("co");
    await expect(page.getByRole("combobox", { name: "Status" })).toHaveValue(
      "active",
    );
    await expect(page.getByRole("combobox", { name: "Owner" })).toHaveValue(
      "own_priya",
    );
    await expect(count(page)).toHaveText(words);
    await expect(bodyRows(page)).toHaveCount(narrowed);
  });

  test("C3: a header reorders rows with aria-sort and ?sort= matching", async ({
    page,
  }) => {
    await page.goto("/demo/records");
    const vendorHead = table(page).getByRole("columnheader", {
      name: "Vendor",
    });
    await expect(vendorHead).toHaveAttribute("aria-sort", "ascending");
    expect((await vendorsInTable(page))[0]).toBe("Alderley Web Studio");

    await vendorHead.getByRole("button").click();
    await expect(page).toHaveURL(/[?&]sort=vendor-desc(&|$)/);
    await expect(vendorHead).toHaveAttribute("aria-sort", "descending");
    expect((await vendorsInTable(page))[0]).toBe("Zephyr Air Filtration");

    const valueHead = table(page).getByRole("columnheader", {
      name: "Annual value (USD)",
    });
    await valueHead.getByRole("button").click();
    await expect(page).toHaveURL(/[?&]sort=value-desc(&|$)/);
    await expect(valueHead).toHaveAttribute("aria-sort", "descending");
    await expect(vendorHead).not.toHaveAttribute("aria-sort", /.*/);
    expect((await vendorsInTable(page))[0]).toBe("Tidewater Software");
  });

  test("C3: with the prefs default renews-asc and no ?sort= the table opens soonest renewal first", async ({
    page,
    context,
    baseURL,
  }) => {
    const prefs = {
      v: 1,
      onboarded: true,
      compactRows: false,
      defaultSort: "renews-asc",
    };
    await context.addCookies([
      {
        name: "pem_demo_prefs",
        value: encodeURIComponent(JSON.stringify(prefs)),
        url: `${baseURL}/demo`,
      },
    ]);
    await page.goto("/demo/records");
    await expect(
      table(page).getByRole("columnheader", { name: "Renews" }),
    ).toHaveAttribute("aria-sort", "ascending");
    expect((await vendorsInTable(page))[0]).toBe("Xenon Lighting");
    expect(page.url()).not.toContain("sort=");
  });

  test("C4: the vendor link or anywhere on the row opens the record", async ({
    page,
  }) => {
    await page.goto("/demo/records");
    await table(page).getByRole("link", { name: "Halvorsen Freight" }).click();
    await expect(page).toHaveURL(/\/demo\/records\/rec_4a1d$/);

    await page.goto("/demo/records");
    await bodyRows(page)
      .filter({ hasText: "Greyfold Security" })
      .getByText("31,500")
      .click();
    await expect(page).toHaveURL(/\/demo\/records\/rec_7be3$/);
  });

  test("C5: Clear filters on no-results clears every filter, shows 40 records and focuses search", async ({
    page,
  }) => {
    await page.goto("/demo/records?state=no-results");
    await expect(
      page.getByText("No records match these filters"),
    ).toBeVisible();
    await expect(
      page.getByText('Vendor contains "Zephyr" and status is Terminated.'),
    ).toBeVisible();
    await expect(count(page)).toHaveText("0 of 40 records");

    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(count(page)).toHaveText("40 records");
    await expect(
      page.getByRole("searchbox", { name: "Filter by vendor" }),
    ).toBeFocused();
    await expect(
      page.getByRole("searchbox", { name: "Filter by vendor" }),
    ).toHaveValue("");
    await expect(page.getByRole("combobox", { name: "Status" })).toHaveValue(
      "",
    );
    await expect(page.getByRole("combobox", { name: "Owner" })).toHaveValue("");
    await expect(page).toHaveURL(/\/demo\/records$/);
  });

  test("C6: offline disables New record, described by the notice, and filters still work", async ({
    page,
  }) => {
    await page.goto("/demo/records?state=offline");
    const notice = page
      .getByRole("status")
      .filter({ hasText: "You are offline" });
    await expect(notice).toBeVisible();
    const newRecord = page.getByRole("button", { name: "New record" });
    await expect(newRecord).toBeDisabled();
    const describedBy = await newRecord.getAttribute("aria-describedby");
    expect(describedBy).toBe(await notice.getAttribute("id"));

    await page.getByRole("combobox", { name: "Status" }).selectOption("draft");
    await expect(page).toHaveURL(/[?&]status=draft(&|$)/);
    await expect(count(page)).toHaveText(/^\d+ of 40 records$/);
  });

  test("C6: partial shows Not loaded for the same three records, and the notice says 3", async ({
    page,
  }) => {
    await page.goto("/demo/records?state=partial");
    await expect(
      page.getByRole("status").filter({ hasText: "Some owners did not load" }),
    ).toContainText('3 records show "Not loaded" for Owner.');
    const missing = bodyRows(page).filter({ hasText: "Not loaded" });
    await expect(missing).toHaveCount(3);
    for (const vendor of NOT_LOADED)
      await expect(missing.filter({ hasText: vendor })).toHaveCount(1);
  });

  test("C7: deleted drops the record, counts 39, names it in a toast and focuses the h1", async ({
    page,
  }) => {
    await page.goto("/demo/records?state=deleted");
    await expect(count(page)).toHaveText("39 records");
    await expect(table(page).getByText("Greyfold Security")).toHaveCount(0);
    await expect(page.getByText("Greyfold Security deleted")).toBeVisible();
    await expect(
      page.getByText("Demo data resets when you reload."),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: "Records" }),
    ).toBeFocused();
  });
});

test.describe("at 390", () => {
  test.use({ viewport: NARROW });

  test("C3: the Sort select reorders rows and matches ?sort=", async ({
    page,
  }) => {
    await page.goto("/demo/records");
    await expect(table(page)).toBeHidden();
    await expect(listRows(page).first()).toContainText("Alderley Web Studio");
    await page
      .getByRole("combobox", { name: "Sort" })
      .selectOption("value-desc");
    await expect(page).toHaveURL(/[?&]sort=value-desc(&|$)/);
    await expect(listRows(page).first()).toContainText("Tidewater Software");
    await expect(page.getByRole("combobox", { name: "Sort" })).toHaveValue(
      "value-desc",
    );
  });

  test("C4: each row is one link named by its vendor and opens the record", async ({
    page,
  }) => {
    await page.goto("/demo/records");
    await page
      .getByRole("link", { name: "Halvorsen Freight", exact: true })
      .click();
    await expect(page).toHaveURL(/\/demo\/records\/rec_4a1d$/);
  });

  test("C6: partial shows Owner not loaded on the same three rows", async ({
    page,
  }) => {
    await page.goto("/demo/records?state=partial");
    const missing = listRows(page).filter({ hasText: "Owner not loaded" });
    await expect(missing).toHaveCount(3);
    for (const vendor of NOT_LOADED)
      await expect(missing.filter({ hasText: vendor })).toHaveCount(1);
    await expect(
      page.getByRole("status").filter({ hasText: "Some owners did not load" }),
    ).toContainText("3 records");
  });
});
