<script setup>
import { ref } from "vue";
import { useToast } from "vue-toastification";
import SearchBar from "@/components/SearchBar.vue";
import ThumbCard from "@/components/ThumbCard.vue";
import Loading from "@/components/Loading.vue";

const props = defineProps({
  placeholder: { type: String, default: "Search" },
  searchFn: { type: Function, required: true },
  showCount: { type: Boolean, default: true },
  titleFormatter: {
    type: Function,
    default: (count, query) => `Found ${count} results for '${query}'`,
  },
});

const emit = defineEmits(["results"]);
const toast = useToast();
const query = ref("");
const resultsQuery = ref("");
const isSearching = ref(false);
const results = ref([]);

async function onSearch(value) {
  const q = (value ?? "").trim();
  query.value = q;

  if (q.length < 3) {
    results.value = [];
    resultsQuery.value = "";
    emit("results", results.value);
    return;
  }

  try {
    isSearching.value = true;
    const data = await props.searchFn(q);
    const list = data?.response ?? data ?? [];
    results.value = Array.isArray(list) ? list : [];
    resultsQuery.value = q;
    emit("results", results.value);
  } catch (e) {
    results.value = [];
    resultsQuery.value = q;
    toast.error("Error while searching, try again later.");
  } finally {
    isSearching.value = false;
  }
}
</script>

<template>
  <SearchBar v-model="query" :placeholder="placeholder" @search="onSearch" />
  <div v-if="isSearching">
    <Loading />
  </div>

  <div v-if="resultsQuery" class="results-container">
    <h1 class="results-title text-preset-1">
      {{ titleFormatter(results.length, resultsQuery) }}
    </h1>
    <ul class="results-items">
      <li v-for="item in results" :key="item.id">
        <ThumbCard :item="item" />
      </li>
    </ul>
  </div>

  <div class="main-layout" v-else-if="!isSearching">
    <slot />
  </div>
</template>

<style scoped>
.results-container {
  display: flex;
  flex-direction: column;
  padding: 0 1rem;
  gap: 1rem;
}

.results-title {
  color: white;
}

.results-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10.25rem, 1fr));
  gap: 1.5rem 0.75rem;
  overflow-x: auto;
  list-style: none;
}

.results-items > li {
  width: 100%;
  display: flex;
  justify-content: center;
}

.main-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .results-container {
    gap: 1.5rem;
  }

  .results-items {
    grid-template-columns: repeat(auto-fit, minmax(13.75rem, 1fr));
    gap: 2rem 1rem;
  }

  .main-layout {
    gap: 2rem;
  }
}

@media (min-width: 1024px) and (min-height: 512px) {
  .results-container {
    gap: 2rem;
  }

  .results-items {
    grid-template-columns: repeat(auto-fit, minmax(17.5rem, 1fr));
  }
}
</style>
