import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import type { ConfigOptions } from "@nuxt/test-utils/playwright";

const rootDir = fileURLToPath(
  new URL("./test/fixtures/basic", import.meta.url),
);

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
  projects: [
    // SSR dev mode
    {
      name: "ssr-dev-chrome",
      use: {
        ...devices["Desktop Chrome"],
        nuxt: { rootDir },
      },
    },
    {
      name: "ssr-dev-firefox",
      use: {
        ...devices["Desktop Firefox"],
        nuxt: { rootDir },
      },
    },
    {
      name: "ssr-dev-safari",
      use: {
        ...devices["Desktop Safari"],
        nuxt: { rootDir },
      },
    },
    // SSR production build
    {
      name: "ssr-build-chrome",
      use: {
        ...devices["Desktop Chrome"],
        nuxt: { rootDir, build: true },
      },
    },
    {
      name: "ssr-build-firefox",
      use: {
        ...devices["Desktop Firefox"],
        nuxt: { rootDir, build: true },
      },
    },
    {
      name: "ssr-build-safari",
      use: {
        ...devices["Desktop Safari"],
        nuxt: { rootDir, build: true },
      },
    },
    // Static generation (SSG)
    {
      name: "ssg-chrome",
      use: {
        ...devices["Desktop Chrome"],
        nuxt: {
          rootDir,
          build: true,
          nuxtConfig: {
            nitro: { prerender: { routes: ["/"] } },
          },
        },
      },
    },
    {
      name: "ssg-firefox",
      use: {
        ...devices["Desktop Firefox"],
        nuxt: {
          rootDir,
          build: true,
          nuxtConfig: {
            nitro: { prerender: { routes: ["/"] } },
          },
        },
      },
    },
    {
      name: "ssg-safari",
      use: {
        ...devices["Desktop Safari"],
        nuxt: {
          rootDir,
          build: true,
          nuxtConfig: {
            nitro: { prerender: { routes: ["/"] } },
          },
        },
      },
    },
  ],
});
