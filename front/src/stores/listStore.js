import { defineStore } from "pinia";
import ListService from "@/services/listService";
import TmdbService from "@/services/tmdbService.js";

const listService = new ListService();

export const useListStore = defineStore("list", {
  state: () => ({
    lists: [],
    listItems: {},
  }),
  getters: {
    watchlist: (state) =>
      state.lists.find((l) => l.slug === "watchlist") || null,
    itemsFor: (state) => (listId) =>
      state.listItems[listId] ?? { moviesItems: [], seriesItems: [] },
  },
  actions: {
    async fetchLists() {
      const lists = await listService.getUserLists();
      this.lists = Array.isArray(lists) ? lists : [];
    },

    async fetchList(id) {
      const list = await listService.getList(id);
      const index = this.lists.findIndex((l) => l.id === list.id);
      if (index >= 0) this.lists[index] = list;
      else this.lists.push(list);
      listService.updateLocalStorage(this.lists);
      return list;
    },

    async fetchListItems(listId) {
      let list = this.lists.find((l) => l.id === listId);
      if (!list) list = await this.fetchList(listId);

      const movieIds = Array.isArray(list.movies) ? list.movies : [];
      const seriesIds = Array.isArray(list.series) ? list.series : [];

      const tmdb = new TmdbService();
      const [moviesItems, seriesItems] = await Promise.all([
        Promise.all(movieIds.map((id) => tmdb.getItemById("movie", id))),
        Promise.all(seriesIds.map((id) => tmdb.getItemById("tv", id))),
      ]);

      this.listItems[listId] = { moviesItems, seriesItems };
      return this.listItems[listId];
    },

    async createList(name) {
      const newList = await listService.createList(name);
      this.lists.push(newList);
      listService.updateLocalStorage(this.lists);
      return newList;
    },

    async deleteList(id) {
      const resp = await listService.deleteList(id);
      if (resp?.status >= 200 && resp?.status < 300) {
        this.lists = this.lists.filter((l) => l.id !== id);
        listService.updateLocalStorage(this.lists);
        return true;
      }
      return false;
    },

    async addItemToList(listId, { id, type }) {
      const data = await listService.addItemToList(listId, { id, type });
      const i = this.lists.findIndex((l) => l.id === listId);
      if (i >= 0) {
        const serverArray = Array.isArray(data?.[type]) ? data[type] : null;
        const current = Array.isArray(this.lists[i][type])
          ? this.lists[i][type]
          : [];
        const next =
          serverArray ?? (current.includes(id) ? current : [...current, id]);
        this.lists[i] = { ...this.lists[i], [type]: next };
      } else {
        await this.fetchList(listId);
      }

      listService.updateLocalStorage(this.lists);
      return this.lists.find((l) => l.id === listId);
    },

    async removeItemFromList({ listId, type, itemId }) {
      const resp = await listService.removeItemFromList({
        listId,
        type,
        itemId,
      });
      if (resp?.status >= 200 && resp?.status < 300) {
        const i = this.lists.findIndex((l) => l.id === listId);
        if (i >= 0) {
          const arr = Array.isArray(this.lists[i][type])
            ? this.lists[i][type]
            : [];
          if (arr.includes(itemId)) {
            this.lists[i] = {
              ...this.lists[i],
              [type]: arr.filter((x) => x !== itemId),
            };
          }
          listService.updateLocalStorage(this.lists);
        } else {
          await this.fetchList(listId);
        }
        return true;
      }
      return false;
    },

    async ensureListsLoaded() {
      if (!this.lists.length) {
        await this.fetchLists();
      }
    },

    normalizeListType(input) {
      const type = String(input || "").toLowerCase();
      if (type === "movie") return "movies";
      return "series";
    },

    isItemInList(listId, item) {
      const list = this.lists.find((l) => l.id === listId);
      if (!list || !item?.id) return false;
      const type = this.normalizeListType(item.type ?? item.mediaType);
      const arr = Array.isArray(list[type]) ? list[type] : [];
      return arr.includes(item.id);
    },

    async toggleItemInList(listId, item) {
      const present = this.isItemInList(listId, item);
      const type = this.normalizeListType(item.type ?? item.mediaType);

      if (present) {
        const ok = await this.removeItemFromList({
          listId,
          type,
          itemId: item.id,
        });
        return ok ? false : true;
      } else {
        await this.addItemToList(listId, { id: item.id, type });
        return this.isItemInList(listId, item);
      }
    },

    clear() {
      this.lists = [];
      this.listItems = {};
    },
  },
});
