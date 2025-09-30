import { backendApi } from "@/api/backendApi";

export default class BookmarkService {
  async changeBookmarked(item) {
    const id = item.id;
    let type = (item.type ?? item.mediaType).toString().toLowerCase();
    if (type === "tv") {
      type = "series";
    } else if (type === "movie") {
      type = "movies";
    }

    if (!type || !id) {
      return false;
    }

    const token = localStorage.getItem("accessToken");
    let response;

    try {
      if (item.isBookmarked) {
        response = await backendApi.delete(`/me/bookmarks/${type}/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
      } else {
        const payload = { itemId: id, type };
        response = await backendApi.post("/me/bookmarks", payload, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });
      }
    } catch (err) {
      throw err.response?.data ?? { error: err.message };
    }

    const data = response.data ?? [];
    this.updateLocalStorage(type, data);

    return response.data;
  }

  async getAllBookmarkeds() {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await backendApi.get(`/me/bookmarks`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = response.data ?? [];
      const type = "all";
      this.updateLocalStorage(type, data);

      return data;
    } catch (error) {
      return false;
    }
  }

  updateLocalStorage(type, data) {
    switch (type) {
      case "movies":
        localStorage.setItem(
          "bookmarkedMovies",
          JSON.stringify(data.movies ?? [])
        );
        break;

      case "series":
        localStorage.setItem(
          "bookmarkedSeries",
          JSON.stringify(data.series ?? [])
        );
        break;

      default:
        localStorage.setItem(
          "bookmarkedMovies",
          JSON.stringify(data.movies ?? [])
        );
        localStorage.setItem(
          "bookmarkedSeries",
          JSON.stringify(data.series ?? [])
        );
        break;
    }
  }
}
