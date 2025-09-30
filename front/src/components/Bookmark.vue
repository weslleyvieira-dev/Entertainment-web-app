<script setup>
import { ref, computed } from "vue";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import BookmarkService from "@/services/bookmarkService";

const bookmarkStore = useBookmarkStore();
const bookmarkService = new BookmarkService();
const hover = ref(false);

const props = defineProps({
  item: { type: Object, required: true },
});
const item = props.item;
const isBookmarked = computed(() => bookmarkStore.isBookmarked(item));

async function changeBookmarked() {
  item.isBookmarked = isBookmarked.value;
  await bookmarkService.changeBookmarked(item);
  bookmarkStore.updateFromLocalStorage();
  await bookmarkStore.fetchBookmarkedItems();
  item.isBookmarked = isBookmarked.value;
}
</script>

<template>
  <div
    v-if="isBookmarked"
    @click="changeBookmarked"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    class="bookmark"
  >
    <img
      :src="
        hover
          ? '/assets/icon-bookmark-remove.svg'
          : '/assets/icon-bookmark-full.svg'
      "
      alt="Bookmarked"
      class="icon"
    />
  </div>
  <div
    v-else
    @click="changeBookmarked"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    class="bookmark"
  >
    <img
      :src="
        hover
          ? '/assets/icon-bookmark-add.svg'
          : '/assets/icon-bookmark-empty.svg'
      "
      alt="Not Bookmarked"
      class="icon"
    />
  </div>
</template>

<style scoped>
.bookmark {
  width: 2rem;
  height: 2rem;
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background-color: rgba(16, 20, 30, 0.5);
  transition: 300ms ease;
}

.bookmark:hover {
  background-color: white;
}

.bookmark:hover .icon {
  filter: brightness(0) invert(0);
}

.icon {
  width: 0.813rem;
  height: 1rem;
}
</style>
