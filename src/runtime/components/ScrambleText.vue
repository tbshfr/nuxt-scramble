<script setup lang="ts">
import { useRuntimeConfig } from "#app";
import { encode } from "../utils/scramble";
import type { ScrambleOptions } from "../utils/scramble";

const props = defineProps<{
  text: string;
  // optionaly override the pattern type for styling / semantics
  type?: string;
}>();

const config = useRuntimeConfig();
const options = config.public.scramble as ScrambleOptions;

// encoded value for SSR fallback
const encodedText = encode(props.text);
</script>

<template>
  <ClientOnly>
    <span class="scramble-decoded" :data-scramble-type="type || 'custom'">{{
      text
    }}</span>

    <template #fallback>
      <span
        :data-scramble="encodedText"
        :class="options?.className || 'scrambled'"
        :data-scramble-type="type || 'custom'"
      />
    </template>
  </ClientOnly>
</template>
