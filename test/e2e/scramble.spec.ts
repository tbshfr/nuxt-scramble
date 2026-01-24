import { expect, test } from "@nuxt/test-utils/playwright";

test.describe("Scramble Module E2E", () => {
  test("decodes scrambled email on hydration", async ({ page, goto }) => {
    await goto("/", { waitUntil: "hydration" });

    const emailLink = page.locator("#auto-email a");
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute("href", "mailto:contact@test.com");
    await expect(emailLink).toHaveText("contact@test.com");
  });

  test("decodes scrambled phone on hydration", async ({ page, goto }) => {
    await goto("/", { waitUntil: "hydration" });

    const phoneLink = page.locator("#auto-phone a");
    await expect(phoneLink).toBeVisible();
    await expect(phoneLink).toHaveAttribute("href", "tel:+1 123-456-7891");
    await expect(phoneLink).toHaveText("+1 123-456-7891");
  });

  test("removes placeholder after hydration", async ({ page, goto }) => {
    await goto("/", { waitUntil: "hydration" });

    const placeholders = page.locator('[data-scramble-placeholder="true"]');
    await expect(placeholders).toHaveCount(0);
  });

  test("ScrambleText component decodes correctly", async ({ page, goto }) => {
    await goto("/", { waitUntil: "hydration" });

    const componentEmail = page.locator("#comp-email a");
    await expect(componentEmail).toHaveAttribute(
      "href",
      "mailto:component@example.com",
    );
    await expect(componentEmail).toHaveText("component@example.com");
  });

  test("ScrambleText phone component decodes correctly", async ({
    page,
    goto,
  }) => {
    await goto("/", { waitUntil: "hydration" });

    const componentPhone = page.locator("#comp-phone a");
    await expect(componentPhone).toHaveAttribute(
      "href",
      "tel:+44 20 7946 0958",
    );
  });

  test("no hydration errors in console", async ({ page, goto }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await goto("/", { waitUntil: "hydration" });
    await page.waitForTimeout(500);

    const hydrationErrors = errors.filter(
      (e) =>
        e.includes("Hydration") ||
        e.includes("hydration") ||
        e.includes("mismatch"),
    );
    expect(hydrationErrors).toHaveLength(0);
  });

  test("existing mailto links are preserved", async ({ page, goto }) => {
    await goto("/", { waitUntil: "hydration" });

    const existingLink = page.locator('a[href="mailto:existing@link.com"]');
    await expect(existingLink).toBeVisible();
    await expect(existingLink).toHaveText("Existing mailto");
  });

  test("ScrambleText custom type renders without link", async ({
    page,
    goto,
  }) => {
    await goto("/", { waitUntil: "hydration" });

    const customEl = page.locator("#comp-custom");
    await expect(customEl).toContainText("secret-data-123");

    const link = customEl.locator("a");
    await expect(link).toHaveCount(0);
  });

  test("ScrambleText respects link=false prop", async ({ page, goto }) => {
    await goto("/", { waitUntil: "hydration" });

    const nolinkEl = page.locator("#comp-nolink");
    await expect(nolinkEl).toContainText("nolink@");

    const link = nolinkEl.locator("a");
    await expect(link).toHaveCount(0);
  });
});
