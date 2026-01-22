<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRuntimeConfig } from "#app";
import { encode, decode } from "../utils/scramble";
import type { ScrambleOptions } from "../utils/scramble";

const props = defineProps<{
  text: string;
  // optionaly override the pattern type for styling / semantics
  type?: string;
}>();

const config = useRuntimeConfig();
const options = config.public.scramble as ScrambleOptions;

const isClient = ref(false);
const decodedText = ref("");

const encodedText = computed(() => encode(props.text));

onMounted(() => {
  decodedText.value = decode(encodedText.value);
  isClient.value = true;
});
</script>

<template>
  <span
    v-if="!isClient"
    :data-scramble="encodedText"
    :class="options?.className || 'scrambled'"
    :data-scramble-type="type || 'custom'"
  />
  <span
    v-else
    class="scramble-decoded"
    :data-scramble-type="type || 'custom'"
    >{{ decodedText }}</span
  >
</template>
