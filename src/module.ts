import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addComponentsDir,
  addImportsDir,
  addServerPlugin,
} from "@nuxt/kit";
import type { ScramblePattern } from "./runtime/utils/scramble";

export interface ModuleOptions {
  // enable/disable module (default: true)
  enabled?: boolean;
  // include default paterns for emails and phone numbers (default: true)
  defaultPatterns?: boolean;
  // custom patterns to match and scramble
  patterns?: ScramblePattern[];
  // data attribute name used to mark scrambled elements (default: 'data-scramble')
  attribute?: string;
  // css class added to scrambled elements (default: 'scrambled')
  className?: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-scramble",
    configKey: "scramble",
  },
  defaults: {
    enabled: true,
    defaultPatterns: true,
    patterns: [],
    attribute: "data-scramble",
    className: "scrambled",
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    if (!options.enabled) {
      return;
    }

    nuxt.options.runtimeConfig.public.scramble = {
      enabled: options.enabled ?? true,
      defaultPatterns: options.defaultPatterns ?? true,
      patterns: options.patterns ?? [],
      attribute: options.attribute ?? "data-scramble",
      className: options.className ?? "scrambled",
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
