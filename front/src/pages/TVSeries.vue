<script setup>
import { ref, onBeforeMount } from "vue";
import { useToast } from "vue-toastification";
import TmdbService from "@/services/tmdbService.js";
import SearchLayout from "@/layouts/SearchLayout.vue";
import ThumbTrending from "@/components/ThumbTrending.vue";
import ThumbCard from "@/components/ThumbCard.vue";
import Loading from "@/components/Loading.vue";

const toast = useToast();
const tmdbService = new TmdbService();
const isLoading = ref(true);
const trendingItems = ref([]);
const onTheAir = ref([]);
const recommended = ref([]);
const hasResults = ref(false);

function onResults(list) {
  hasResults.value = Array.isArray(list) && list.length > 0;
}

async function fetchData() {
  isLoading.value = true;
  try {
    trendingItems.value = await tmdbService.getTrending("tv");
    onTheAir.value = await tmdbService.getCurrentlyList("tv");
    recommended.value = await tmdbService.getPopular("tv");
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
      :searchFn="(query) => tmdbService.search(query, 'tv')"
      placeholder="Search for TV series"
      @results="onResults"
    >
      <div v-if="!hasResults" class="trending-container">
        <h1 class="trending-title text-preset-1">Trending TV Series</h1>
        <ul class="trending-items">
          <li v-for="item in trendingItems" :key="item.id">
            <ThumbTrending :item="item" />
          </li>
        </ul>
      </div>
      <div v-if="!hasResults" class="currently-container">
        <h1 class="currently-title text-preset-1">Now Playing</h1>
        <ul class="currently-items">
          <li v-for="item in onTheAir" :key="item.id">
            <ThumbTrending :item="item" />
          </li>
        </ul>
      </div>
      <div v-if="!hasResults" class="recommended-container">
        <h1 class="recommended-title text-preset-1">Recommended for you</h1>
        <ul class="recommended-items">
          <li v-for="item in recommended" :key="item.id">
            <ThumbCard :item="item" />
          </li>
        </ul>
      </div>
    </SearchLayout>
  </template>
</template>

<style scoped>
.trending-container,
.currently-container,
.recommended-container {
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
  gap: 1rem;
}

.recommended-container {
  padding: 0 1rem;
}

.trending-title,
.currently-title,
.recommended-title {
  color: white;
}

.trending-items,
.currently-items,
.recommended-items {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  list-style: none;
  padding-bottom: 0.5rem;
}

.recommended-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10.25rem, 1fr));
  gap: 1.5rem 0.75rem;
  padding-bottom: 0;
}

.recommended-items > li {
  width: 100%;
  display: flex;
  justify-content: center;
}

.currently-items {
  display: flex;
}

@media (min-width: 768px) {
  .recommended-items {
    grid-template-columns: repeat(auto-fit, minmax(13.75rem, 1fr));
    gap: 2rem 1rem;
  }
}

@media (min-width: 1024px) and (min-height: 512px) {
  .recommended-items {
    grid-template-columns: repeat(auto-fit, minmax(17.5rem, 1fr));
  }
}
</style>
