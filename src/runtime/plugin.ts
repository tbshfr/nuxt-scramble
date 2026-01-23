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

  // decode scrambled href attributes (tel and mailto links)
  decodeScrambledHrefElements(key);

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
          link.className = "scramble-link scramble-decoded";

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

function decodeScrambledHrefElements(key: string): void {
  const elements = document.querySelectorAll("[data-scramble-href]");

  elements.forEach((element) => {
    const encoded = element.getAttribute("data-scramble-href");
    const prefix = element.getAttribute("data-scramble-href-prefix");

    if (!encoded || !prefix) {
      return;
    }

    try {
      const decoded = decode(encoded, key);

      const href =
        prefix.toLowerCase() === "tel:"
          ? prefix + normalizePhone(decoded)
          : prefix + decoded;

      element.setAttribute("href", href);

      element.removeAttribute("data-scramble-href");
      element.removeAttribute("data-scramble-href-prefix");
    } catch (error) {
      console.warn("[nuxt-scramble] Failed to decode href:", error);
    }
  });
}
