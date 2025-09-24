<script setup>
import { ref, onBeforeMount } from "vue";
import { useToast } from "vue-toastification";
import TmdbService from "@/services/tmdbService.js";
import SearchBar from "@/components/SearchBar.vue";
import ThumbTrending from "@/components/ThumbTrending.vue";
import Loading from "@/components/Loading.vue";

const toast = useToast();
const tmdbService = new TmdbService();
const isLoading = ref(true);
let trendingItems = ref([]);

async function getTrending() {
  try {
    trendingItems.value = await tmdbService.getTrending();
  } catch (error) {
    toast.error(
      "An unexpected error occurred. Please try again later. Error: " +
        error.message
    );
    trendingItems.value = [];
  } finally {
    isLoading.value = false;
  }
}

onBeforeMount(getTrending);
</script>

<template>
  <Loading v-if="isLoading" />
  <template v-else>
    <SearchBar placeholder="Search for movies or TV series" />
    <div class="trending-conteiner">
      <h1 class="trending-title text-preset-1">Trending</h1>
      <ul class="trending-items">
        <li v-for="item in trendingItems" :key="item.id">
          <ThumbTrending :item="item" />
        </li>
      </ul>
    </div>
  </template>
</template>

<style scoped>
.trending-conteiner {
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
  gap: 1rem;
}

.trending-title {
  color: white;
}

.trending-items {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  list-style: none;
}
</style>
