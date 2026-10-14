<script setup lang="ts">
import { computed, useSlots } from "vue";
import { useRuntimeConfig } from "#app";
import { decode, encode, getLinkPrefix } from "../utils/scramble";
import type { ScrambleOptions, ScramblePattern } from "../utils/scramble";

const props = withDefaults(
  defineProps<{
    text?: string;
    // already encoded value, used for content scrambled at build time so the plain text never reaches the payload
    encoded?: string;
    // optionaly override the pattern type for semantics or link creation
    type?: ScramblePattern["name"];
    // override autoLink for this instance
    link?: boolean;
  }>(),
  {
    text: undefined,
    encoded: undefined,
    // vue seems to treat optional missing boolean props as false by default
    // without defaults the global config autoLink is not used
    type: undefined,
    link: undefined,
  },
);

const slots = useSlots();
const config = useRuntimeConfig();
const options = config.public.scramble as ScrambleOptions;

// encoded value for SSR fallback
const encodedText = computed(
  () => props.encoded ?? encode(props.text ?? "", options.key),
);
// only rendered on the client
const value = computed(
  () => props.text ?? decode(props.encoded ?? "", options.key),
);

const href = computed(() => {
  const shouldLink =
    props.link ?? (options.autoLink && props.type && props.type !== "custom");
  const linkPrefix = props.type ? getLinkPrefix(props.type) : null;
  return shouldLink && linkPrefix ? linkPrefix + value.value : null;
});
</script>

<template>
  <ClientOnly>
    <a
      v-if="href"
      :href="href"
      class="scramble-link scramble-decoded"
      :data-scramble-type="type || 'custom'"
      ><slot>{{ value }}</slot></a
    >
    <span v-else class="scramble-decoded" :data-scramble-type="type || 'custom'"
      ><slot>{{ value }}</slot></span
    >

    <template #fallback>
      <!-- only the link target is sensitive, a link target isnt -->
      <span
        v-if="slots.default"
        :class="options?.className || 'scrambled'"
        :data-scramble-type="type || 'custom'"
        ><slot
      /></span>
      <span
        v-else
        :data-scramble="encodedText"
        data-scramble-component
        :class="options?.className || 'scrambled'"
        :data-scramble-type="type || 'custom'"
        aria-hidden="true"
        >{{ options?.placeholder || "[protected]" }}</span
      >
    </template>
  </ClientOnly>
</template>
