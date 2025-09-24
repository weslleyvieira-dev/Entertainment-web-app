<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const showTrailer = ref(false);

const props = defineProps({
  item: { type: Object, required: true },
});

const item = props.item;

const fallbackImg = "/assets/image-not-found.png";
const imgSrc = computed(() => item.imgTrending || fallbackImg);

const categoryIcon = computed(() =>
  item.type === "tv"
    ? "/assets/icon-category-tv.svg"
    : "/assets/icon-category-movie.svg"
);

const categoryLabel = computed(() =>
  item.type === "tv" ? "TV Series" : "Movie"
);

function openTrailer() {
  showTrailer.value = true;
  document.body.style.overflow = "hidden";
}

function closeTrailer() {
  showTrailer.value = false;
  document.body.style.overflow = "";
}

function onKeydown(e) {
  if (e.key === "Escape") closeTrailer();
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="thumb-container">
    <div v-if="item.trailer" class="trailer-container">
      <button
        type="button"
        class="trailer-link text-preset-4"
        @click.prevent="openTrailer"
      >
        <img src="/assets/icon-play.svg" alt="Play Trailer" class="trailer" />
        Play
      </button>
    </div>
    <img :src="imgSrc" :alt="item.title" class="thumb-img" />
    <div class="thumb-details">
      <ul class="thumb-infos">
        <li>
          <h5 class="text-preset-6">{{ item.release_date }}</h5>
        </li>
        <li>
          <h5 class="category text-preset-6">
            <img
              :src="categoryIcon"
              :alt="categoryLabel"
              class="img-category"
            />
            {{ categoryLabel }}
          </h5>
        </li>
        <li>
          <h5 class="text-preset-6">{{ item.classification }}</h5>
        </li>
      </ul>
      <h3 class="thumb-title text-preset-4">{{ item.title }}</h3>
    </div>
    <div
      v-if="showTrailer"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      @click="closeTrailer"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <button class="close-btn" @click="closeTrailer" aria-label="Fechar">
            <img src="/assets/icon-close.svg" alt="Close Trailer" />
          </button>
        </div>
        <div class="trailer-frame-wrap">
          <iframe
            v-if="showTrailer"
            class="trailer-iframe"
            :src="item.trailer"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.thumb-container {
  width: 10.25rem;
  height: 9.875rem;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
}

.trailer-container {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  inset: 0;
  opacity: 0;
  transition: opacity 300ms ease-in;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 3;
}

.trailer-container .trailer-link {
  width: 7.313rem;
  height: 3rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-left: 0.625rem;
  border-radius: 1.781rem;
  text-decoration: none;
  border: none;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.25);
}

.trailer-container .trailer-link:hover {
  background-color: var(--red-500);
}

.trailer-container .text-preset-4 {
  font-family: "Outfit";
  color: white;
}

.thumb-container:hover .trailer-container {
  opacity: 1;
}

.thumb-img {
  width: 100%;
  height: 6.875rem;
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
  line-height: 1;
  z-index: 2;
}

.thumb-infos {
  display: flex;
  align-items: center;
}

.thumb-infos li {
  list-style: none;
  display: inline-flex;
  align-items: center;
}

.thumb-infos li + li::before {
  content: "";
  display: inline-block;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  margin: 0 0.5rem;
}

.thumb-infos .text-preset-6 {
  color: white;
  opacity: 0.75;
  display: inline-flex;
  align-items: center;
  margin: 0;
}

.thumb-infos .category {
  gap: 0.5rem;
}

.thumb-infos .img-category {
  width: 0.625rem;
  height: 0.625rem;
}

.thumb-title {
  width: 100%;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  width: 75%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-header {
  display: flex;
  justify-content: flex-end;
}

.trailer-frame-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
}

.trailer-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.25);
  border: none;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0.15rem;
  border-radius: 50%;
  cursor: pointer;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}

@media (min-width: 768px) {
  .thumb-container {
    width: 13.75rem;
    height: 12.188rem;
  }

  .thumb-img {
    height: 8.75rem;
  }

  .thumb-infos .text-preset-6 {
    font-size: 0.813rem;
  }

  .thumb-infos .img-category {
    width: 0.75rem;
    height: 0.75rem;
  }

  .thumb-title {
    font-size: 1.125rem;
  }

  .modal-content {
    width: 65%;
  }

  .trailer-frame-wrap {
    aspect-ratio: 4 / 3;
  }

  .close-btn {
    width: 2rem;
    height: 2rem;
    padding: 0.25rem;
  }
}

@media (min-width: 1024px) and (min-height: 512px) {
  .thumb-container {
    width: 17.5rem;
    height: 14.313rem;
  }

  .thumb-img {
    height: 10.875rem;
  }

  .modal-content {
    width: 50%;
  }

  .trailer-frame-wrap {
    aspect-ratio: 16 / 9;
  }
}
</style>
