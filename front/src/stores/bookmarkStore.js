import { defineStore } from "pinia";
import TmdbService from "@/services/tmdbService.js";

export const useBookmarkStore = defineStore("bookmark", {
  state: () => ({
    movies: [],
    series: [],
    moviesItems: [],
    seriesItems: [],
  }),
  actions: {
    setBookmarks({ movies = [], series = [] }) {
      this.movies = movies;
      this.series = series;
    },
    updateFromLocalStorage() {
      this.movies = JSON.parse(
        localStorage.getItem("bookmarkedMovies") || "[]"
      );
      this.series = JSON.parse(
        localStorage.getItem("bookmarkedSeries") || "[]"
      );
    },
    isBookmarked(item) {
      const type = (item.type ?? item.mediaType)?.toLowerCase();
      if (type === "movie") return this.movies.includes(item.id);
      if (type === "tv" || type === "series")
        return this.series.includes(item.id);
      return false;
    },
    async fetchBookmarkedItems() {
      const tmdbService = new TmdbService();
      const moviesPromises = this.movies.map((id) =>
        tmdbService.getItemById("movie", id)
      );
      const seriesPromises = this.series.map((id) =>
        tmdbService.getItemById("tv", id)
      );

      this.moviesItems = await Promise.all(moviesPromises);
      this.seriesItems = await Promise.all(seriesPromises);
    },
  },
});
