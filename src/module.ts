import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addComponentsDir,
  addServerPlugin,
} from "@nuxt/kit";
import type { ScramblePattern } from "./runtime/utils/scramble";
import { generateKey } from "./runtime/utils/scramble";

export interface AutoScrambleOptions {
  // include default paterns for emails and phone numbers (default: true)
  defaultPatterns?: boolean;
  // custom patterns to match and scramble
  patterns?: ScramblePattern[];
}

export interface ModuleOptions {
  // data attribute name used to mark scrambled elements (default: 'data-scramble')
  attribute?: string;
  // css class added to scrambled elements (default: 'scrambled')
  className?: string;
  // auto create mailto:/tel: links (default: true) */
  autoLink?: boolean;
  // placeholder text shown when js is disabled or while its still loading (default: '[protected]')
  placeholder?: string;
  // automatically scramble matching patterns in rendered HTML via Nitro plugin (default: false)
  // only enable this if you prerender your pages because it has a performance impact on SSR
  autoScramble?: boolean | AutoScrambleOptions;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-scramble",
    configKey: "scramble",
  },
  defaults: {
    attribute: "data-scramble",
    className: "scrambled",
    autoLink: true,
    placeholder: "[protected]",
    autoScramble: false,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // generate a unique key per build for XOR encoding
    // this makes the encoded strings different for each build (should help against scrapers that get the key one time and try to reuse it later)
    // this will never help against scrapers that have js enabled
    const key = generateKey(16);

    const autoScrambleEnabled =
      options.autoScramble !== false && options.autoScramble !== undefined;
    const autoScrambleOptions =
      typeof options.autoScramble === "object" ? options.autoScramble : {};

    nuxt.options.runtimeConfig.public.scramble = {
      defaultPatterns: autoScrambleOptions.defaultPatterns ?? true,
      patterns: autoScrambleOptions.patterns ?? [],
      attribute: options.attribute ?? "data-scramble",
      className: options.className ?? "scrambled",
      key,
      autoLink: options.autoLink ?? true,
      placeholder: options.placeholder ?? "[protected]",
    };

    addComponentsDir({
      path: resolver.resolve("./runtime/components"),
      pathPrefix: false,
    });

    addPlugin({
      src: resolver.resolve("./runtime/plugin"),
      mode: "client",
    });

    if (autoScrambleEnabled) {
      addServerPlugin(resolver.resolve("./runtime/server/plugins/scramble"));
    }
  },
});
