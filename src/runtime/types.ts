import type { ScrambleOptions } from "./utils/scramble";

declare module "nuxt/schema" {
  interface PublicRuntimeConfig {
    scramble: ScrambleOptions;
  }
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $scramble: {
      encode: (text: string) => string;
      decode: (encoded: string) => string;
    };
  }
}

export {};
