<script setup>
import {
  ref,
  computed,
  onBeforeMount,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useToast } from "vue-toastification";
import { useListStore } from "@/stores/listStore";
import TmdbService from "@/services/tmdbService.js";
import SearchLayout from "@/layouts/SearchLayout.vue";
import ThumbCard from "@/components/ThumbCard.vue";
import Loading from "@/components/Loading.vue";
import { useRoute, useRouter } from "vue-router";
import ActionButton from "@/components/ActionButton.vue";

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

const renamingList = ref(false);
const newListName = ref("");
const inputEl = ref(null);

const showDeleteModal = ref(false);

function onResults(list) {
  hasResults.value = Array.isArray(list) && list.length > 0;
}

function startRename() {
  if (!currentList.value) return;
  renamingList.value = true;
  newListName.value = currentList.value.name;
  nextTick(() => inputEl.value?.focus());
}

async function submitNewList() {
  const name = newListName.value.trim();
  if (!name || !listId.value) return;
  try {
    const updated = await listStore.renameList(listId.value, name);
    toast.success("List renamed.");
    renamingList.value = false;
    newListName.value = "";
    if (updated.slug !== slug.value) {
      await router.replace({ params: { slug: updated.slug } });
    }
  } catch (e) {
    toast.error("Failed to rename list. " + (e?.message || e));
  }
}

function openDeleteModal() {
  showDeleteModal.value = true;
}

function cancelDelete() {
  showDeleteModal.value = false;
}

async function confirmDelete() {
  if (!listId.value) return;
  try {
    const ok = await listStore.deleteList(listId.value);
    if (ok) {
      toast.success("List deleted.");
      showDeleteModal.value = false;
      await router.push({ name: "Lists" });
    } else {
      toast.error("Failed to delete list.");
    }
  } catch (e) {
    toast.error("Failed to delete list. " + (e?.message || e));
  }
}

function cancelRename() {
  renamingList.value = false;
  newListName.value = "";
}

function onKey(e) {
  if (e.key === "Escape") {
    if (renamingList.value) cancelRename();
    if (showDeleteModal.value) cancelDelete();
  }
}

onMounted(() => document.addEventListener("keydown", onKey));
onBeforeUnmount(() => document.removeEventListener("keydown", onKey));

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

const searchList = (query) => {
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
      :searchFn="searchList"
      placeholder="Search in this list"
      @results="onResults"
    >
      <div v-if="!hasResults" class="bookmarked-container">
        <div class="list-header">
          <h1 v-if="!renamingList" class="list-title text-preset-1">
            {{ currentList?.name || "List" }}
          </h1>
          <div v-else class="option rename-option">
            <input
              ref="inputEl"
              v-model="newListName"
              class="new-list-input text-preset-4"
              type="text"
              placeholder="New list name"
              @keydown.enter.prevent="submitNewList"
            />
          </div>
          <div class="list-actions">
            <ActionButton v-if="!renamingList" @click="startRename" class="btn">
              <img class="action-img" src="/assets/icon-pencil.svg" />Rename
            </ActionButton>
            <ActionButton
              v-else
              @click="submitNewList"
              class="btn"
              :disabled="!newListName.trim()"
            >
              <img class="action-img" src="/assets/icon-check.svg" />Save
            </ActionButton>

            <ActionButton
              v-if="!renamingList"
              @click="openDeleteModal"
              class="btn"
            >
              <img class="action-img" src="/assets/icon-delete.svg" />Delete
            </ActionButton>
            <ActionButton v-else @click="cancelRename" class="btn">
              <img class="action-img" src="/assets/icon-close.svg" />Cancel
            </ActionButton>
          </div>
        </div>
        <h1
          v-if="moviesItems.length > 0"
          class="bookmarked-title text-preset-1"
        >
          Movies
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
      </div>
      <div v-if="!hasResults" class="bookmarked-container">
        <h1
          v-if="seriesItems.length > 0"
          class="bookmarked-title text-preset-1"
        >
          TV Series
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
      </div>
    </SearchLayout>
    <div
      v-if="showDeleteModal"
      class="delete-overlay"
      @click.self="cancelDelete"
    >
      <div class="delete-modal">
        <h3 class="modal-title text-preset-3">
          Delete list "{{ currentList?.name }}"?
        </h3>
        <p class="modal-text text-preset-4">This action cannot be undone.</p>
        <div class="modal-actions">
          <ActionButton @click="confirmDelete">Confirm </ActionButton>
          <ActionButton @click="cancelDelete">Cancel </ActionButton>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
.list-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
}

.list-actions {
  display: flex;
  gap: 0.5rem;
}

.list-actions .btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-img {
  height: 20px;
}

.list-actions .btn:hover .action-img {
  filter: brightness(0) saturate(100%) invert(8%) sepia(8%) saturate(1754%)
    hue-rotate(146deg) brightness(97%) contrast(96%);
}

.rename-option {
  flex: 1;
}

.new-list-input {
  width: 100%;
  height: 3rem;
  padding: 0 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid var(--blue-500);
  background: var(--blue-900);
  font-size: 1.25rem;
  font-weight: var(--text-light);
  color: white;
}

.new-list-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.bookmarked-container {
  display: flex;
  flex-direction: column;
  padding: 0 1rem;
  gap: 1rem;
}

.list-title,
.bookmarked-title {
  color: white;
}

.list-title,
.modal-title {
  width: 100%;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
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

.delete-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  z-index: 10;
}

.delete-modal {
  width: 90%;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-radius: 1rem;
  background: var(--blue-900);
}

.modal-title,
.modal-text {
  -webkit-line-clamp: 3;
  line-clamp: 3;
  color: white;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.modal-actions .action-button {
  background-color: var(--blue-950);
}

.action-button:hover,
.action-button:focus {
  background-color: white;
}

@media (min-width: 768px) {
  .list-title {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

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

  .delete-modal {
    width: 50%;
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

  .delete-modal {
    width: 30%;
  }
}
</style>
