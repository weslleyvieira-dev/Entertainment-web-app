<script setup>
const emit = defineEmits(["click"]);
</script>

<template>
  <button
    type="button"
    aria-label=""
    @click="emit('click')"
    class="action-button"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
.action-button {
  font-family: "Outfit", sans-serif;
  font-weight: var(--text-medium);
  font-size: 0.875rem;
  line-height: 125%;
  letter-spacing: 0;
  width: auto;
  height: 3rem;
  padding: 0.5rem 0.75rem;
  color: white;
  outline: none;
  border: none;
  border-radius: 6px;
  background-color: var(--blue-900);
}

.action-button:hover,
.action-button:focus {
  cursor: pointer;
  color: var(--blue-950);
  background-color: white;
}

@media (min-width: 768px) {
  .action-button {
    font-size: 1rem;
  }
}
</style>
