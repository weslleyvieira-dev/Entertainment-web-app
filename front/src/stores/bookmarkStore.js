import { defineStore } from "pinia";

export const useBookmarkStore = defineStore("bookmark", {
  state: () => ({
    movies: [],
    series: [],
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
  },
});
