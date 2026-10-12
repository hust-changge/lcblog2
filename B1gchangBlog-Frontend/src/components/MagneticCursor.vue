<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const dotRef = ref(null);
const onPointerMove = (event) => {
  if (event.pointerType && event.pointerType !== 'mouse') return;
  dotRef.value.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
};

onMounted(() => {
  if (!dotRef.value || !window.matchMedia('(pointer: fine)').matches) return;
  dotRef.value.style.transform = `translate3d(${window.innerWidth / 2}px, ${window.innerHeight / 2}px, 0)`;
  window.addEventListener('pointermove', onPointerMove, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove);
});
</script>

<template>
  <div ref="dotRef" class="magnetic-cursor-dot" aria-hidden="true" />
</template>

<style scoped>
.magnetic-cursor-dot {
  display: none;
  position: fixed;
  top: -2.5px;
  left: -2.5px;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: #17f700;
  border: 1.5px solid rgba(255, 255, 255, 0.95);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.35),
    0 0 10px rgba(57, 255, 20, 0.95),
    0 0 22px rgba(57, 255, 20, 0.6);
  pointer-events: none;
  z-index: 100000;
  will-change: transform;
}

@media (pointer: fine) {
  .magnetic-cursor-dot {
    display: block;
  }
}
</style>
