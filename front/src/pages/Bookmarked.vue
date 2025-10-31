<script setup>
import { ref, computed, onBeforeMount, watch } from "vue";
import { useToast } from "vue-toastification";
import { useListStore } from "@/stores/listStore";
import TmdbService from "@/services/tmdbService.js";
import SearchLayout from "@/layouts/SearchLayout.vue";
import ThumbCard from "@/components/ThumbCard.vue";
import Loading from "@/components/Loading.vue";

const toast = useToast();
const listStore = useListStore();
const tmdbService = new TmdbService();
const isLoading = ref(true);
const hasResults = ref(false);

const watchlist = computed(() =>
  listStore.lists.find((list) => list.slug === "watchlist")
);
const moviesItems = computed(
  () => listStore.itemsFor(watchlist.value?.id || "").moviesItems
);
const seriesItems = computed(
  () => listStore.itemsFor(watchlist.value?.id || "").seriesItems
);

function onResults(list) {
  hasResults.value = Array.isArray(list) && list.length > 0;
}

async function fetchListItems() {
  if (!watchlist.value) {
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    await listStore.fetchListItems(watchlist.value.id);
  } catch (error) {
    toast.error(
      "An unexpected error occurred. Please try again later. Error: " +
        (error?.message || error)
    );
  } finally {
    isLoading.value = false;
  }
}

onBeforeMount(async () => {
  try {
    if (!listStore.lists.length) {
      await listStore.fetchLists();
    }
  } catch (error) {
    toast.error(
      "Failed to load your lists. Error: " + (error?.message || error)
    );
  } finally {
    await fetchListItems();
  }
});

watch(
  () => [
    watchlist.value?.movies?.join(",") ?? "",
    watchlist.value?.series?.join(",") ?? "",
  ],
  async () => {
    await fetchListItems();
  }
);

const searchWatchlist = (query) => {
  const movies = tmdbService.searchBookmarkedItems(moviesItems.value, query);
  const series = tmdbService.searchBookmarkedItems(seriesItems.value, query);
  return [...movies, ...series];
};
</script>

<template>
  <Loading v-if="isLoading" />
  <template v-else>
    <SearchLayout
      :searchFn="searchWatchlist"
      placeholder="Search your watchlist"
      @results="onResults"
    >
      <div v-if="!hasResults" class="bookmarked-container">
        <h1 class="bookmarked-title text-preset-1">Watchlist Movies</h1>
        <ul
          v-if="moviesItems.length > 0"
          class="bookmarked-items"
          :class="{
            'tablet-row': moviesItems.length <= 2,
            'desktop-row': moviesItems.length <= 3,
          }"
        >
          <li v-for="item in moviesItems" :key="item.id">
            <ThumbCard :item="item" />
          </li>
        </ul>
        <p v-else class="empty-bookmarks">
          You have no movies in your watchlist.
        </p>
      </div>
      <div v-if="!hasResults" class="bookmarked-container">
        <h1 class="bookmarked-title text-preset-1">Watchlist Series</h1>
        <ul
          v-if="seriesItems.length > 0"
          class="bookmarked-items"
          :class="{
            'tablet-row': seriesItems.length <= 2,
            'desktop-row': seriesItems.length <= 3,
          }"
        >
          <li v-for="item in seriesItems" :key="item.id">
            <ThumbCard :item="item" />
          </li>
        </ul>
        <p v-else class="empty-bookmarks">
          You have no series in your watchlist.
        </p>
      </div>
    </SearchLayout>
  </template>
</template>

<style scoped>
.bookmarked-container {
  display: flex;
  flex-direction: column;
  padding: 0 1rem;
  gap: 1rem;
}

.bookmarked-title {
  color: white;
}

.empty-bookmarks {
  color: var(--red-500);
}

.bookmarked-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10.25rem, 1fr));
  gap: 1.5rem 0.75rem;
  overflow-x: auto;
  list-style: none;
}

.bookmarked-items > li {
  display: flex;
  justify-content: center;
}

@media (min-width: 768px) {
  .bookmarked-items {
    grid-template-columns: repeat(auto-fit, minmax(13.75rem, 1fr));
    gap: 2rem 1rem;
  }

  .tablet-row {
    grid-template-columns: repeat(auto-fit, 13.75rem);
  }

  .tablet-row > li {
    justify-content: flex-start;
  }
}

@media (min-width: 1024px) and (min-height: 512px) {
  .bookmarked-items {
    grid-template-columns: repeat(auto-fit, minmax(17.5rem, 1fr));
  }

  .desktop-row {
    grid-template-columns: repeat(auto-fit, 17.5rem);
  }

  .desktop-row > li {
    justify-content: flex-start;
  }
}
</style>
