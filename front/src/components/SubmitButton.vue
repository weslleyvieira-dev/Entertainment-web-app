<script setup></script>

<template>
  <button
    type="submit"
    aria-label="Submit form"
    @click="$emit('click')"
    class="submit-button"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
.submit-button {
  font-family: "Outfit", sans-serif;
  font-weight: var(--text-light);
  width: 100%;
  height: 3rem;
  color: white;
  outline: none;
  border: none;
  border-radius: 6px;
  background-color: var(--red-500);
}

.submit-button:hover {
  cursor: pointer;
  color: var(--blue-950);
  background-color: white;
}
</style>
