import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addComponentsDir,
  addServerPlugin,
  hasNuxtModule,
} from "@nuxt/kit";
import type { ModuleDependencies, Nuxt } from "@nuxt/schema";
import type { ScramblePattern } from "./runtime/utils/scramble";
import { generateKey, getAllPatterns } from "./runtime/utils/scramble";
import rehypeScramble from "./runtime/content/rehype";

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
  // scramble matching patterns in @nuxt/content markdown at build time (default: false)
  // uses the patterns from autoScramble, or the default patterns when autoScramble is not an object
  content?: boolean;
}

// moduleDependencies runs before setup, both need the same key
const buildKeys = new WeakMap<Nuxt, string>();

function getBuildKey(nuxt: Nuxt): string {
  let key = buildKeys.get(nuxt);
  if (!key) {
    // generate a unique key per build for XOR encoding
    // this makes the encoded strings different for each build (should help against scrapers that get the key one time and try to reuse it later)
    // this will never help against scrapers that have js enabled
    key = generateKey(16);
    buildKeys.set(nuxt, key);
  }
  return key;
}

function resolveAutoScrambleOptions(
  autoScramble: ModuleOptions["autoScramble"],
): AutoScrambleOptions {
  return typeof autoScramble === "object" ? autoScramble : {};
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
    content: false,
  },
  moduleDependencies(nuxt): ModuleDependencies {
    const options =
      (nuxt.options as { scramble?: ModuleOptions }).scramble ?? {};
    if (!options.content || !hasNuxtModule("@nuxt/content", nuxt)) {
      return {};
    }

    const autoScrambleOptions = resolveAutoScrambleOptions(
      options.autoScramble,
    );
    const patterns = getAllPatterns({
      defaultPatterns: autoScrambleOptions.defaultPatterns ?? true,
      patterns: autoScrambleOptions.patterns ?? [],
    });
    if (patterns.length === 0) {
      return {};
    }

    return {
      "@nuxt/content": {
        optional: true,
        defaults: {
          build: {
            markdown: {
              rehypePlugins: {
                // content includes these options in its parse cache hash, so a new key
                // per build also invalidates previously cached files
                "nuxt-scramble": {
                  instance: rehypeScramble,
                  options: { key: getBuildKey(nuxt), patterns },
                },
              },
            },
          },
        },
      },
    };
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    const key = getBuildKey(nuxt);

    const autoScrambleEnabled =
      options.autoScramble !== false && options.autoScramble !== undefined;
    const autoScrambleOptions = resolveAutoScrambleOptions(
      options.autoScramble,
    );

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
