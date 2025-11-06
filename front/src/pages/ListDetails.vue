<script setup>
import { ref, computed, onBeforeMount, watch } from "vue";
import { useToast } from "vue-toastification";
import { useListStore } from "@/stores/listStore";
import TmdbService from "@/services/tmdbService.js";
import SearchLayout from "@/layouts/SearchLayout.vue";
import ThumbCard from "@/components/ThumbCard.vue";
import Loading from "@/components/Loading.vue";
import { useRoute, useRouter } from "vue-router";

const toast = useToast();
const listStore = useListStore();
const tmdbService = new TmdbService();
const isLoading = ref(true);
const hasResults = ref(false);

const route = useRoute();
const router = useRouter();
const slug = computed(() => String(route.params.slug || ""));
const currentList = computed(
  () => listStore.lists.find((l) => l.slug === slug.value) || null
);
const listId = computed(() => currentList.value?.id || "");
const moviesItems = computed(
  () => listStore.itemsFor(listId.value).moviesItems || []
);
const seriesItems = computed(
  () => listStore.itemsFor(listId.value).seriesItems || []
);

function onResults(list) {
  hasResults.value = Array.isArray(list) && list.length > 0;
}

async function fetchListItems() {
  if (!listId.value) {
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    await listStore.fetchListItems(listId.value);
  } catch (error) {
    toast.error(
      "An unexpected error occurred. Please try again later. Error: " +
        (error?.message || error)
    );
  } finally {
    isLoading.value = false;
  }
}

const searchWatchlist = (query) => {
  const movies = tmdbService.searchBookmarkedItems(moviesItems.value, query);
  const series = tmdbService.searchBookmarkedItems(seriesItems.value, query);
  return [...movies, ...series];
};

onBeforeMount(async () => {
  try {
    await listStore.ensureListsLoaded();
    if (!currentList.value) {
      toast.error("List not found.");
      await router.push({ name: "Lists" });
      return;
    }
  } catch (error) {
    toast.error(
      "Failed to load your lists. Error: " + (error?.message || error)
    );
  } finally {
    await fetchListItems();
  }
});

watch(() => slug.value, fetchListItems);
watch(
  () => [
    currentList.value?.movies?.join(",") ?? "",
    currentList.value?.series?.join(",") ?? "",
  ],
  fetchListItems
);
</script>

<template>
  <Loading v-if="isLoading" />
  <template v-else>
    <SearchLayout
      :searchFn="searchWatchlist"
      placeholder="Search in this list"
      @results="onResults"
    >
      <div v-if="!hasResults" class="bookmarked-container">
        <h1 class="bookmarked-title text-preset-1">
          {{ currentList?.name || "List" }} Movies
        </h1>
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
        <p v-else class="empty-bookmarks">You have no movies in this list.</p>
      </div>
      <div v-if="!hasResults" class="bookmarked-container">
        <h1 class="bookmarked-title text-preset-1">
          {{ currentList?.name || "List" }} Series
        </h1>
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
        <p v-else class="empty-bookmarks">You have no series in this list.</p>
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
