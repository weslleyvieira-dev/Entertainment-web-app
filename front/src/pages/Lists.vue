<script setup>
import { ref, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useListStore } from "@/stores/listStore";
import { storeToRefs } from "pinia";
import Loading from "@/components/Loading.vue";
import TmdbService from "@/services/tmdbService";

const router = useRouter();
const toast = useToast();
const tmdbService = new TmdbService();
const listStore = useListStore();
const { lists } = storeToRefs(listStore);
const isLoading = ref(true);

const fallbackImg = "/assets/image-not-found.png";

async function getThumb() {
  const array = lists.value ?? [];
  await Promise.all(
    array.map(async (list) => {
      try {
        let img;

        if (list?.movies?.length) {
          const movie = await tmdbService.getItemById("movie", list.movies[0]);
          img = movie?.imgTrending || movie?.imgDefault;
        } else if (list?.series?.length) {
          const tv = await tmdbService.getItemById("tv", list.series[0]);
          img = tv?.imgTrending || tv?.imgDefault;
        }

        list.thumb = img || fallbackImg;
      } catch (e) {
        list.thumb = fallbackImg;
      }
    })
  );
}

onBeforeMount(async () => {
  try {
    if (!lists.value?.length) {
      await listStore.fetchLists();
    }
    await getThumb();
  } catch (error) {
    toast.error(
      "Failed to load your lists. Error: " + (error?.message || error)
    );
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <Loading v-if="isLoading" />
  <template v-else>
    <div
      class="lists-container"
      :class="{
        'tablet-row': (lists?.length || 0) <= 1,
        'desktop-row': (lists?.length || 0) <= 2,
      }"
    >
      <div
        class="thumb-container"
        @click="
          router.push({ name: 'ListDetails', params: { slug: list.slug } })
        "
        v-for="list in lists"
        :key="list.id"
      >
        <img
          :src="list.thumb || fallbackImg"
          :alt="list.name"
          draggable="false"
          class="thumb-img"
        />
        <div class="thumb-details">
          <ul class="thumb-infos">
            <li>
              <h5 class="text-preset-5">
                {{ (list.movies?.length || 0) + (list.series?.length || 0) }}
                Items
              </h5>
            </li>
          </ul>
          <h3 class="thumb-title text-preset-3">{{ list.name }}</h3>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
.lists-container {
  display: grid;
  grid-template-columns: repeat(1);
  padding: 0 1rem;
  gap: 1rem;
  overflow-x: auto;
  list-style: none;
  padding-bottom: 0.5rem;
}

.item-container {
  display: flex;
  justify-content: center;
  width: auto;
}

.thumb-container {
  width: 100%;
  height: 8.75rem;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.thumb-img {
  width: 100%;
  height: 100%;
  border-radius: 0.5rem;
  object-fit: cover;
  position: absolute;
  z-index: 1;
}

.thumb-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  position: absolute;
  inset: 0;
  gap: 0.5rem;
  padding: 1rem;
  line-height: 1;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.85) 100%
  );
  z-index: 2;
}

.thumb-infos {
  display: flex;
  align-items: center;
}

.thumb-infos li {
  list-style: none;
}

.thumb-infos .text-preset-5 {
  color: white;
  opacity: 0.75;
  display: inline-flex;
  align-items: center;
  margin: 0;
}

.thumb-infos .category {
  gap: 0.5rem;
}

.thumb-title {
  width: 100%;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 768px) {
  .lists-container {
    grid-template-columns: repeat(auto-fit, minmax(calc(50% - 0.5rem), 1fr));
  }

  .thumb-container {
    height: 14.375rem;
  }

  .thumb-details {
    padding: 1.344rem 1.5rem;
  }

  .thumb-infos .text-preset-5 {
    font-size: 0.938rem;
  }

  .thumb-title {
    font-size: 1.5rem;
  }

  .tablet-row {
    grid-template-columns: repeat(
      auto-fit,
      minmax(13.75rem, calc(50% - 0.5rem))
    );
  }
}

@media (min-width: 1024px) and (min-height: 512px) {
  .lists-container {
    grid-template-columns: repeat(auto-fit, minmax(calc(30% - 0.5rem), 1fr));
  }

  .desktop-row {
    grid-template-columns: repeat(auto-fit, minmax(calc(30% - 0.5rem), 35rem));
  }
}
</style>
