import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addComponentsDir,
  addImportsDir,
  addServerPlugin,
} from "@nuxt/kit";
import type { ScramblePattern } from "./runtime/utils/scramble";
import { generateKey } from "./runtime/utils/scramble";

export interface ModuleOptions {
  // include default paterns for emails and phone numbers (default: true)
  defaultPatterns?: boolean;
  // custom patterns to match and scramble
  patterns?: ScramblePattern[];
  // data attribute name used to mark scrambled elements (default: 'data-scramble')
  attribute?: string;
  // css class added to scrambled elements (default: 'scrambled')
  className?: string;
  // auto create mailto:/tel: links (default: true) */
  autoLink?: boolean;
  // placeholder text shown when js is disabled or while its still loading (default: '[protected]')
  placeholder?: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-scramble",
    configKey: "scramble",
  },
  defaults: {
    defaultPatterns: true,
    patterns: [],
    attribute: "data-scramble",
    className: "scrambled",
    autoLink: true,
    placeholder: "[protected]",
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // generate a unique key per build for XOR encoding
    // this makes the encoded strings different for each build (should help against scrapers that get the key one time and try to reuse it later)
    // this will never help against scrapers that have js enabled
    const key = generateKey(16);

    nuxt.options.runtimeConfig.public.scramble = {
      defaultPatterns: options.defaultPatterns ?? true,
      patterns: options.patterns ?? [],
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

    addImportsDir(resolver.resolve("./runtime/composables"));

    addPlugin({
      src: resolver.resolve("./runtime/plugin"),
      mode: "client",
    });

    addServerPlugin(resolver.resolve("./runtime/server/plugins/scramble"));
  },
});
