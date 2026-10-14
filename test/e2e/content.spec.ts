import { expect, test } from "@nuxt/test-utils/playwright";
import type { Page } from "@playwright/test";

function collectHydrationErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (
      (msg.type() === "error" || msg.type() === "warning") &&
      /hydration|mismatch/i.test(text)
    ) {
      errors.push(text);
    }
  });
  return errors;
}

test.describe("Nuxt Content", () => {
  test("decodes content on hydration without mismatches", async ({
    page,
    goto,
  }) => {
    const errors = collectHydrationErrors(page);
    await goto("/", { waitUntil: "hydration" });

    const body = page.locator("#content-body");
    await expect(
      body.locator('a[href="mailto:index@content.test"]'),
    ).toHaveText("index@content.test");
    await expect(body.locator('a[href="tel:+1 123-456-7891"]')).toHaveText(
      "+1 123-456-7891",
    );
    await expect(body.locator('a[href="mailto:auto@content.test"]')).toHaveText(
      "auto@content.test",
    );
    await expect(body.locator("[data-scramble]")).toHaveCount(0);
    await expect(body).not.toContainText("[protected]");

    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);
  });

  test("keeps custom link labels", async ({ page, goto }) => {
    await goto("/", { waitUntil: "hydration" });

    const body = page.locator("#content-body");
    await expect(
      body.locator('a[href="mailto:label@content.test"]'),
    ).toHaveText("Mail us");
    await expect(body.locator('a[href="tel:+431234567891"]')).toHaveText(
      "our office",
    );
  });

  test("does not nest links", async ({ page, goto }) => {
    await goto("/", { waitUntil: "hydration" });

    const link = page.locator('#content-body a[href="/other"]');
    await expect(link).toHaveText("docs link for docs@content.test");
    await expect(link.locator("a")).toHaveCount(0);
  });

  test("decodes content after client side navigation", async ({
    page,
    goto,
  }) => {
    const errors = collectHydrationErrors(page);
    await goto("/", { waitUntil: "hydration" });

    await page.click("#link-other");
    await page.waitForURL("**/other");

    const body = page.locator("#content-body");
    await expect(
      body.locator('a[href="mailto:other@content.test"]'),
    ).toHaveText("other@content.test");

    await page.click("#link-index");
    await page.waitForURL((url) => url.pathname === "/");
    await expect(
      body.locator('a[href="mailto:index@content.test"]'),
    ).toHaveText("index@content.test");
    await expect(body.locator("[data-scramble]")).toHaveCount(0);

    expect(errors).toHaveLength(0);
  });
});
