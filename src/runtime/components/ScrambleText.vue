<script setup lang="ts">
import { useRuntimeConfig } from "#app";
import { encode, getLinkPrefix, normalizePhone } from "../utils/scramble";
import type { ScrambleOptions, ScramblePattern } from "../utils/scramble";

const props = defineProps<{
  text: string;
  // optionaly override the pattern type for semantics or link creation
  type?: ScramblePattern["name"];
  // override autoLink for this instance
  link?: boolean;
}>();

const config = useRuntimeConfig();
const options = config.public.scramble as ScrambleOptions;

// encoded value for SSR fallback
const encodedText = encode(props.text, options.key);

const shouldLink =
  props.link ?? (options.autoLink && props.type && props.type !== "custom");
const linkPrefix = props.type ? getLinkPrefix(props.type) : null;
const href = linkPrefix
  ? props.type === "phone"
    ? linkPrefix + normalizePhone(props.text)
    : linkPrefix + props.text
  : null;
</script>

<template>
  <ClientOnly>
    <a
      v-if="shouldLink && href"
      :href="href"
      class="scramble-link scramble-decoded"
      :data-scramble-type="type || 'custom'"
      >{{ text }}</a
    >
    <span
      v-else
      class="scramble-decoded"
      :data-scramble-type="type || 'custom'"
      >{{ text }}</span
    >

    <template #fallback>
      <span
        :data-scramble="encodedText"
        :class="options?.className || 'scrambled'"
        :data-scramble-type="type || 'custom'"
        aria-hidden="true"
      />
    </template>
  </ClientOnly>
</template>
