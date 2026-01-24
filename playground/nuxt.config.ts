export default defineNuxtConfig({
  modules: ["nuxt-scramble"],
  devtools: { enabled: true },
  compatibilityDate: "latest",
  scramble: {
    attribute: "data-scramble",
    className: "scrambled",
    autoLink: true,
    placeholder: "[protected]",
    autoScramble: {
      defaultPatterns: true,
      patterns: [{ name: "ssn", pattern: "\\d{3}-\\d{2}-\\d{4}" }],
    },
  },
});
