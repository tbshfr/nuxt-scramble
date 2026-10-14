import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import type { ConfigOptions } from "@nuxt/test-utils/playwright";

const fixtures = [
  { suffix: "", dir: "basic", testMatch: "scramble.spec.ts", routes: ["/"] },
  {
    suffix: "-content",
    dir: "content",
    testMatch: "content.spec.ts",
    routes: ["/", "/other"],
  },
];

const browsers = [
  { name: "chrome", device: devices["Desktop Chrome"] },
  { name: "firefox", device: devices["Desktop Firefox"] },
  { name: "safari", device: devices["Desktop Safari"] },
];

const modes = [
  { name: "ssr-dev", nuxt: {} },
  { name: "ssr-build", nuxt: { build: true } },
  { name: "ssg", nuxt: { build: true, prerender: true } },
];

export default defineConfig<ConfigOptions>({
  testDir: "./test/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    trace: "on-first-retry",
  },
  projects: fixtures.flatMap((fixture) => {
    const rootDir = fileURLToPath(
      new URL(`./test/fixtures/${fixture.dir}`, import.meta.url),
    );

    return modes.flatMap((mode) =>
      browsers.map((browser) => ({
        name: `${mode.name}-${browser.name}${fixture.suffix}`,
        testMatch: fixture.testMatch,
        use: {
          ...browser.device,
          nuxt: {
            rootDir,
            build: mode.nuxt.build,
            nuxtConfig: mode.nuxt.prerender
              ? { nitro: { prerender: { routes: fixture.routes } } }
              : undefined,
          },
        },
      })),
    );
  }),
});
