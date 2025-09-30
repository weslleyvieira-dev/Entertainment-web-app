<script setup>
import { ref, onBeforeMount } from "vue";
import { useToast } from "vue-toastification";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import BookmarkService from "@/services/bookmarkService";
import TmdbService from "@/services/tmdbService.js";
import SearchLayout from "@/layouts/SearchLayout.vue";
import ThumbTrending from "@/components/ThumbTrending.vue";
import Loading from "@/components/Loading.vue";

const toast = useToast();
const bookmarkStore = useBookmarkStore();
const bookmarkService = new BookmarkService();
const tmdbService = new TmdbService();
const isLoading = ref(true);
const bookmarks = ref({});
const trendingItems = ref([]);
const inTheatres = ref([]);
const onTheAir = ref([]);
const hasResults = ref(false);

function onResults(list) {
  hasResults.value = Array.isArray(list) && list.length > 0;
}

async function fetchData() {
  isLoading.value = true;
  try {
    bookmarks.value = await bookmarkService.getAllBookmarkeds();
    bookmarkStore.setBookmarks(bookmarks.value);
    trendingItems.value = await tmdbService.getTrending();
    inTheatres.value = await tmdbService.getCurrentlyList("movie");
    onTheAir.value = await tmdbService.getCurrentlyList("tv");
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
      :searchFn="(query) => tmdbService.search(query)"
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
      <div v-if="!hasResults" class="currently-container">
        <h1 class="currently-title text-preset-1">Now Playing</h1>
        <ul class="currently-items">
          <li v-for="item in inTheatres" :key="item.id">
            <ThumbTrending :item="item" />
          </li>
        </ul>
      </div>
      <div v-if="!hasResults" class="currently-container">
        <h1 class="currently-title text-preset-1">On the Air</h1>
        <ul class="currently-items">
          <li v-for="item in onTheAir" :key="item.id">
            <ThumbTrending :item="item" />
          </li>
        </ul>
      </div>
    </SearchLayout>
  </template>
</template>

<style scoped>
.trending-container,
.currently-container {
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
  gap: 1rem;
}

.trending-title,
.currently-title {
  color: white;
}

.trending-items,
.currently-items {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  overflow-x: auto;
  list-style: none;
  padding-bottom: 0.5rem;
}

.currently-items {
  display: flex;
}
</style>
