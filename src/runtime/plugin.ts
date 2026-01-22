import { defineNuxtPlugin, useRuntimeConfig } from "#app";
import { decode, getLinkPrefix, normalizePhone } from "./utils/scramble";
import type { ScrambleOptions, ScramblePattern } from "./utils/scramble";

// client side plugin to devode scrambled elements after hydration to prevent mismatches
// creates accessible mailto/tel links when autoLink is enabled
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
      decodeScrambledElements(options);
    });

    // handle client side navigation for SPAs
    nuxtApp.hook("page:finish", () => {
      requestAnimationFrame(() => {
        decodeScrambledElements(options);
      });
    });
  },
});

function decodeScrambledElements(options: ScrambleOptions): void {
  const { attribute, key, autoLink } = options;
  const elements = document.querySelectorAll(`[${attribute}]`);

  elements.forEach((element) => {
    const encoded = element.getAttribute(attribute);
    const type = element.getAttribute("data-scramble-type") as
      | ScramblePattern["name"]
      | null;

    if (!encoded) {
      return;
    }

    try {
      const decoded = decode(encoded, key);

      // remove aria-hidden since now the real content is showing
      element.removeAttribute("aria-hidden");
      element.removeAttribute(attribute);
      element.classList.remove(options.className);
      element.classList.add("scramble-decoded");

      if (autoLink && type) {
        const prefix = getLinkPrefix(type);

        if (prefix) {
          const link = document.createElement("a");

          const href =
            type === "phone"
              ? prefix + normalizePhone(decoded)
              : prefix + decoded;

          link.href = href;
          link.textContent = decoded;
          link.className = "scramble-link";

          element.replaceWith(link);
          return;
        }
      }

      element.textContent = decoded;
    } catch (error) {
      console.warn("[nuxt-scramble] Failed to decode element:", error);
    }
  });
}
