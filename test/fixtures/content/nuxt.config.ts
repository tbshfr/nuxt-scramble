import scramble from "../../../src/module";

export default defineNuxtConfig({
  modules: ["@nuxt/content", scramble],
  content: {
    experimental: { sqliteConnector: "native" },
  },
  debug: { hydration: true },
  scramble: {
    autoScramble: true,
    content: true,
  },
});
