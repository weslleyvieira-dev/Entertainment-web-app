<script setup>
import { ref, onBeforeMount } from "vue";
import { useToast } from "vue-toastification";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import BookmarkService from "@/services/bookmarkService";
import TmdbService from "@/services/tmdbService.js";
import SearchLayout from "@/layouts/SearchLayout.vue";
import ThumbCard from "@/components/ThumbCard.vue";
import Loading from "@/components/Loading.vue";

const toast = useToast();
const bookmarkStore = useBookmarkStore();
const bookmarkService = new BookmarkService();
const tmdbService = new TmdbService();
const isLoading = ref(true);
const bookmarks = ref({});
const hasResults = ref(false);

function onResults(list) {
  hasResults.value = Array.isArray(list) && list.length > 0;
}

async function fetchData() {
  isLoading.value = true;
  try {
    bookmarks.value = await bookmarkService.getAllBookmarkeds();
    bookmarkStore.setBookmarks(bookmarks.value);
    await bookmarkStore.fetchBookmarkedItems();
  } catch (error) {
    toast.error(
      "An unexpected error occurred. Please try again later. Error: " +
        (error?.message || error)
    );
  } finally {
    isLoading.value = false;
  }
}

onBeforeMount(fetchData);

const searchBookmarked = (query) => {
  const movies = tmdbService.searchBookmarkedItems(
    bookmarkStore.moviesItems,
    query
  );
  const series = tmdbService.searchBookmarkedItems(
    bookmarkStore.seriesItems,
    query
  );
  return [...movies, ...series];
};
</script>

<template>
  <Loading v-if="isLoading" />
  <template v-else>
    <SearchLayout
      :searchFn="searchBookmarked"
      placeholder="Search for bookmarked shows"
      @results="onResults"
    >
      <div v-if="!hasResults" class="bookmarked-container">
        <h1 class="bookmarked-title text-preset-1">Bookmarked Movies</h1>
        <ul
          v-if="bookmarkStore.moviesItems.length > 0"
          class="bookmarked-items"
          :class="{
            'tablet-row': bookmarkStore.moviesItems.length <= 2,
            'desktop-row': bookmarkStore.moviesItems.length <= 3,
          }"
        >
          <li v-for="item in bookmarkStore.moviesItems" :key="item.id">
            <ThumbCard :item="item" />
          </li>
        </ul>
        <p v-else class="empty-bookmarks">You have no bookmarked movies yet.</p>
      </div>
      <div v-if="!hasResults" class="bookmarked-container">
        <h1 class="bookmarked-title text-preset-1">Bookmarked Series</h1>
        <ul
          v-if="bookmarkStore.seriesItems.length > 0"
          class="bookmarked-items"
          :class="{
            'tablet-row': bookmarkStore.seriesItems.length <= 2,
            'desktop-row': bookmarkStore.seriesItems.length <= 3,
          }"
        >
          <li v-for="item in bookmarkStore.seriesItems" :key="item.id">
            <ThumbCard :item="item" />
          </li>
        </ul>
        <p v-else class="empty-bookmarks">You have no bookmarked series yet.</p>
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
