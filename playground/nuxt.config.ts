export default defineNuxtConfig({
  modules: ["nuxt-scramble"],
  devtools: { enabled: true },
  compatibilityDate: "latest",
  scramble: {
    defaultPatterns: true,
    patterns: [{ name: "ssn", pattern: "\\d{3}-\\d{2}-\\d{4}" }],
    attribute: "data-scramble",
    className: "scrambled",
    autoLink: false,
    placeholder: "[protected]",
  },
});
