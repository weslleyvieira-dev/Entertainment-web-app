<script setup>
import { ref } from "vue";

const query = ref("");

const props = defineProps({
  placeholder: {
    type: String,
    default: "Search",
  },
});

function getResult(search) {
  console.log(search);
}
</script>

<template>
  <div class="search-box">
    <img src="/assets/icon-magnify.svg" class="search-icon" />
    <input
      id="query"
      type="text"
      v-model.trim="query"
      :placeholder="$props.placeholder"
      :aria-label="$props.placeholder"
      @keyup="getResult(query)"
      class="search-input text-preset-2"
    />
  </div>
</template>

<style scoped>
.search-box {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 5rem 1rem 1.5rem;
  gap: 1rem;
}

.search-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.search-input {
  width: 100%;
  color: white;
  cursor: pointer;
  border: none;
  background-color: transparent;
}

.search-input::placeholder {
  color: white;
  opacity: 0.5;
}

.search-input:focus {
  border-bottom: 1px solid var(--blue-500);
}

@media (min-width: 768px) {
  .search-box {
    padding: 8rem 1.5rem 2rem;
    gap: 1.5rem;
  }

  .search-icon {
    width: 2rem;
    height: 2rem;
  }
}

@media (min-width: 1024px) and (min-height: 512px) {
  .search-box {
    padding: 4rem 2.25rem 2.5rem 10.25rem;
    gap: 2rem;
  }
}
</style>
