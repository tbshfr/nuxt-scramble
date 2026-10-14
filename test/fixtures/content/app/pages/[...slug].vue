<script setup lang="ts">
const route = useRoute();
const { data: page } = await useAsyncData(route.path, () =>
  queryCollection("content").path(route.path).first(),
);
</script>

<template>
  <ContentRenderer v-if="page" id="content-body" :value="page" />
</template>
