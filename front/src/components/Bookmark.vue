<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useListStore } from "@/stores/listStore";

const listStore = useListStore();
const hover = ref(false);
const showMenu = ref(false);

const props = defineProps({
  item: { type: Object, required: true },
});
const item = props.item;
const lists = computed(() => listStore.lists);
const isBookmarked = computed(() => listStore.isItemInAnyList(item));
const newListName = ref("");
const creatingNewList = ref(false);
const inputEl = ref(null);

function toggleMenu() {
  showMenu.value = !showMenu.value;
  if (!showMenu.value) {
    newListName.value = "";
    creatingNewList.value = false;
  }
}

function isIn(list) {
  const type = listStore.normalizeListType(item.type ?? item.mediaType);
  const array = list[type];
  return array.includes(item.id);
}

async function onToggle(list, checked) {
  const type = listStore.normalizeListType(item.type ?? item.mediaType);
  const present = isIn(list);

  if (checked && !present) {
    await listStore.addItemToList(list.id, { id: item.id, type });
  } else if (!checked && present) {
    await listStore.removeItemFromList({
      listId: list.id,
      type,
      itemId: item.id,
    });
  }
}

function startCreate() {
  creatingNewList.value = true;
  nextTick(() => inputEl.value?.focus());
}

async function submitNewList() {
  const name = newListName.value.trim();
  if (!name) return;
  try {
    const newList = await listStore.createList(name);
    const type = listStore.normalizeListType(item.type ?? item.mediaType);
    await listStore.addItemToList(newList.id, { id: item.id, type });
  } finally {
    newListName.value = "";
    creatingNewList.value = false;
  }
}

function onEsc(e) {
  if (e.key === "Escape") {
    newListName.value = "";
    creatingNewList.value = false;
    showMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener("keydown", onEsc);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onEsc);
});
</script>

<template>
  <div
    @click="toggleMenu"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    class="bookmark"
  >
    <img
      v-if="isBookmarked"
      :src="
        hover
          ? '/assets/icon-bookmark-remove.svg'
          : '/assets/icon-bookmark-full.svg'
      "
      alt="Bookmarked"
      draggable="false"
      class="icon"
    />
    <img
      v-else
      :src="
        hover
          ? '/assets/icon-bookmark-add.svg'
          : '/assets/icon-bookmark-empty.svg'
      "
      alt="Not Bookmarked"
      class="icon"
    />
  </div>

  <div v-if="showMenu" class="menu-overlay" @click.self="toggleMenu">
    <div class="menu-list" @click.stop>
      <div class="menu-title">
        <h3 class="text-title text-preset-3">{{ `${item.title} - Lists` }}</h3>
        <img
          @click="toggleMenu"
          src="/assets/icon-close.svg"
          alt="Close"
          class="close-btn"
        />
      </div>

      <div v-for="list in lists" :key="list.id" class="options-list">
        <label class="option">
          <h4 class="option-name text-preset-4">{{ list.name }}</h4>
          <input
            type="checkbox"
            :checked="isIn(list)"
            @change="(e) => onToggle(list, e.target.checked)"
            class="check"
          />
        </label>
      </div>

      <div v-if="!creatingNewList" class="option" @click="startCreate">
        <h4 class="option-name text-preset-4">Create new list</h4>
        <img src="/assets/icon-playlist-plus.svg" alt="Create new list" />
      </div>
      <div v-else class="option">
        <input
          ref="inputEl"
          v-model="newListName"
          class="new-list-input text-preset-4"
          type="text"
          placeholder="New list name"
          @keydown.enter.prevent="submitNewList"
        />
        <button
          class="create-btn"
          :disabled="!newListName.trim()"
          @click="submitNewList"
        >
          Create
        </button>
      </div>
    </div>
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

.menu-overlay {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.menu-list {
  width: 85%;
  max-height: 60%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  resize: none;
  box-sizing: border-box;
  border-radius: 1.25rem;
  background-color: var(--blue-900);
  overflow-y: scroll;
}

.menu-title {
  display: flex;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--blue-500);
}

.text-title {
  color: white;
}

.close-btn {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0.15rem;
  border-radius: 50%;
  cursor: pointer;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.option {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  background-color: var(--blue-950);
  cursor: pointer;
}

.option-name {
  width: 100%;
  font-weight: var(--text-light);
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.check {
  cursor: pointer;
  accent-color: var(--yellow-500);
  border: none;
}

.new-list-input {
  width: 100%;
  padding: 0 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid var(--blue-500);
  background: var(--blue-900);
  color: white;
}

.new-list-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.create-btn {
  padding: 0.35rem 0.75rem;
  border-radius: 0.35rem;
  border: 1px solid var(--blue-500);
  background: var(--blue-900);
  color: white;
  cursor: pointer;
}

.create-btn:enabled:hover {
  background: var(--blue-500);
}

.create-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

@media (min-width: 768px) {
  .menu-list {
    width: 50%;
  }
}

@media (min-width: 1024px) and (min-height: 512px) {
  .menu-list {
    width: 25%;
  }
}
</style>
