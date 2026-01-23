import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

const fixtureDir = fileURLToPath(new URL("./fixtures/basic", import.meta.url));

describe("nuxt-scramble SSR", async () => {
  await setup({ rootDir: fixtureDir });

  describe("automatic scrambling", () => {
    it("scrambles email addresses", async () => {
      const html = await $fetch("/");
      expect(html).not.toContain("contact@test.com");
      expect(html).toContain('data-scramble-type="email"');
    });

    it("scrambles phone numbers", async () => {
      const html = await $fetch("/");
      expect(html).not.toContain("+1 123-456-7891");
      expect(html).toContain('data-scramble-type="phone"');
    });

    it("scrambles multiple patterns in same element", async () => {
      const html = await $fetch("/");
      expect(html).not.toContain("multi@test.com");
      expect(html).not.toContain("+49 123 456789");
    });

    it("preserves existing mailto/tel links", async () => {
      const html = await $fetch("/");
      expect(html).toContain('href="mailto:existing@link.com"');
      expect(html).toContain('href="tel:+1234567890"');
    });

    it("does not scramble inside tag attributes", async () => {
      const html = await $fetch("/");
      expect(html).toContain('placeholder="user@placeholder.com"');
    });
  });

  describe("ScrambleText component", () => {
    it("renders email with encoded data attribute", async () => {
      const html = await $fetch("/");
      expect(html).not.toContain(">component@example.com<");
      expect(html).toContain("data-scramble=");
    });

    it("renders phone with encoded data", async () => {
      const html = await $fetch("/");
      expect(html).not.toContain(">+44 20 7946 0958<");
    });

    it("renders custom type without link prefix", async () => {
      const html = await $fetch("/");
      expect(html).not.toContain(">secret-data-123<");
      expect(html).toContain('data-scramble-type="custom"');
    });
  });

  describe("SSR output format", () => {
    it("uses XOR hex encoding", async () => {
      const html = await $fetch("/");
      const match = html.match(/data-scramble="([0-9a-f]+)"/);
      expect(match).toBeTruthy();
      expect(match![1]).toMatch(/^[0-9a-f]+$/);
      expect(match![1].length % 2).toBe(0);
    });

    it("includes placeholder text", async () => {
      const html = await $fetch("/");
      expect(html).toContain("[protected]");
    });

    it("includes aria-hidden for accessibility", async () => {
      const html = await $fetch("/");
      expect(html).toContain('aria-hidden="true"');
    });

    it("includes scrambled class", async () => {
      const html = await $fetch("/");
      expect(html).toContain('class="scrambled"');
    });

    it("renders composable fallback during SSR", async () => {
      const html = await $fetch("/");
      expect(html).toContain("composable-fallback");
    });
  });
});
