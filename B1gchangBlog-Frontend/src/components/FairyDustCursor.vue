<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { fairyDustCursor } from 'cursor-effects';

let effect;

onMounted(() => {
  if (!window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  effect = new fairyDustCursor({
    colors: ['#D61C59', '#E7D84B', '#1B8798'],
    fairySymbol: '*',
  });
});

onBeforeUnmount(() => {
  effect?.destroy();
});
</script>

<template></template>
