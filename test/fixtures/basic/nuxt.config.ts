import scramble from "../../../src/module";

export default defineNuxtConfig({
  modules: [scramble],
  scramble: {
    autoScramble: true,
  },
});
