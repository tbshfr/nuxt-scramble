import { defineNuxtPlugin, useRuntimeConfig } from "#app";
import { decode } from "./utils/scramble";
import type { ScrambleOptions } from "./utils/scramble";

// client side plugin to devode scrambled elements after hydration to prevent mismatches
export default defineNuxtPlugin({
  name: "nuxt-scramble",
  enforce: "post", // run after other plugins
  setup(nuxtApp) {
    const config = useRuntimeConfig();
    const options = config.public.scramble as ScrambleOptions;

    if (!options?.enabled) {
      return;
    }

    nuxtApp.hook("app:mounted", () => {
      decodeScrambledElements(options.attribute);
    });

    // handle client side navigation vor SPAs
    nuxtApp.hook("page:finish", () => {
      // small delay to ensure dom is updated
      requestAnimationFrame(() => {
        decodeScrambledElements(options.attribute);
      });
    });
  },
});

function decodeScrambledElements(attribute: string): void {
  const elements = document.querySelectorAll(`[${attribute}]`);

  elements.forEach((element) => {
    const encoded = element.getAttribute(attribute);

    if (!encoded) {
      return;
    }

    try {
      const decoded = decode(encoded);

      element.textContent = decoded;
      element.removeAttribute(attribute);

      // keep class after decoding but add marker
      element.classList.add("scramble-decoded");
    } catch (error) {
      console.warn("[nuxt-scramble] Failed to decode element:", error);
    }
  });
}
