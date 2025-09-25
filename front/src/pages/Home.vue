<script setup>
import { ref, onBeforeMount } from "vue";
import { useToast } from "vue-toastification";
import TmdbService from "@/services/tmdbService.js";
import SearchLayout from "@/layouts/SearchLayout.vue";
import ThumbTrending from "@/components/ThumbTrending.vue";
import Loading from "@/components/Loading.vue";

const toast = useToast();
const tmdbService = new TmdbService();
const isLoading = ref(true);
const trendingItems = ref([]);
const inTheatres = ref([]);
const hasResults = ref(false);

function onResults(list) {
  hasResults.value = Array.isArray(list) && list.length > 0;
}

async function fetchData() {
  isLoading.value = true;
  try {
    trendingItems.value = await tmdbService.getTrending();
    inTheatres.value = await tmdbService.getInTheatres();
  } catch (error) {
    toast.error(
      "An unexpected error occurred. Please try again later. Error: " +
        (error?.message || error)
    );
    trendingItems.value = [];
  } finally {
    isLoading.value = false;
  }
}

onBeforeMount(fetchData);
</script>

<template>
  <Loading v-if="isLoading" />
  <template v-else>
    <SearchLayout
      :searchFn="(q) => tmdbService.searchMulti(q)"
      placeholder="Search for movies or TV series"
      @results="onResults"
    >
      <div v-if="!hasResults" class="trending-container">
        <h1 class="trending-title text-preset-1">Trending</h1>
        <ul class="trending-items">
          <li v-for="item in trendingItems" :key="item.id">
            <ThumbTrending :item="item" />
          </li>
        </ul>
      </div>
      <div v-if="!hasResults" class="theatres-container">
        <h1 class="theatres-title text-preset-1">Now Playing</h1>
        <ul class="theatres-items">
          <li v-for="item in inTheatres" :key="item.id">
            <ThumbTrending :item="item" />
          </li>
        </ul>
      </div>
    </SearchLayout>
  </template>
</template>

<style scoped>
.trending-container,
.theatres-container {
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
  gap: 1rem;
}

.trending-title,
.theatres-title {
  color: white;
}

.trending-items,
.theatres-items {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  overflow-x: auto;
  list-style: none;
}

.theatres-items {
  display: flex;
}
</style>
