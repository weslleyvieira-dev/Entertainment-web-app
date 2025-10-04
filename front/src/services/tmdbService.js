import { tmdbApi, imgTrending, imgDefault } from "@/api/tmdbApi";
const YT_EMBED_BASE = "https://www.youtube.com/embed/";
export default class TmdbService {
  async getTrending(type = "all", limit = 10) {
    const results = [];
    let page = 1;

    do {
      const { data } = await tmdbApi.get(`/trending/${type}/week`, {
        params: { page },
      });

      if ((data?.results ?? []).length === 0) break;

      let filtered;
      if (type === "all") {
        filtered = (data.results || []).filter(
          (item) => item.media_type === "movie" || item.media_type === "tv"
        );
      } else {
        filtered = data.results.map((item) => ({ ...item, media_type: type }));
      }

      const batchResults = await this._processBatch(filtered);
      results.push(...batchResults);
      page += 1;
    } while (results.length < limit);

    results.sort((a, b) => b.popularity - a.popularity);
    return results.slice(0, limit);
  }

  async getCurrentlyList(type, limit = 10) {
    const results = [];
    let page = 1;
    let path;

    if (type === "movie") {
      path = "/movie/now_playing";
    } else if (type === "tv") {
      path = "/tv/on_the_air";
    } else return;

    do {
      const { data } = await tmdbApi.get(`${path}`, {
        params: { page },
      });

      if ((data?.results ?? []).length === 0) break;

      const itemsWithType = data.results.map((item) => ({
        ...item,
        media_type: type,
      }));

      const batchResults = await this._processBatch(itemsWithType);
      results.push(...batchResults);
      page += 1;
    } while (results.length < limit);

    results.sort((a, b) => b.popularity - a.popularity);
    return results.slice(0, limit);
  }

  async getPopular(type) {
    const { data } = await tmdbApi.get(`/discover/${type}`);

    if ((data?.results ?? []).length === 0) return [];

    const itemsWithType = data.results.map((item) => ({
      ...item,
      media_type: type,
    }));
    return await this._processBatch(itemsWithType);
  }

  async search(query, type = "multi") {
    const results = [];

    const { data } = await tmdbApi.get(`/search/${type}`, {
      params: { query },
    });
    if ((data?.results ?? []).length === 0) return null;

    let filtered;
    if (type === "multi") {
      filtered = data.results.filter(
        (item) =>
          (item.media_type === "movie" || item.media_type === "tv") &&
          Number(item?.popularity) >= 2
      );
    } else {
      filtered = data.results
        .filter((item) => Number(item?.popularity) >= 1)
        .map((item) => ({ ...item, media_type: type }));
    }

    const batchResults = await this._processBatch(filtered);
    results.push(...batchResults);

    results.sort((a, b) => b.popularity - a.popularity);
    return results;
  }

  async getItemById(type, id) {
    let append_to_response;
    if (type === "movie") {
      append_to_response = "release_dates,videos";
    } else if (type === "tv") {
      append_to_response = "content_ratings,videos";
    } else {
      return null;
    }

    const { data } = await tmdbApi.get(`/${type}/${id}`, {
      params: { append_to_response },
    });

    const classificationData = data?.release_dates || data?.content_ratings;
    const classification = this._extractClassification(
      type,
      classificationData
    );
    if (!classification) return null;

    const trailer = this._extractTrailer(data.videos);

    const item = this._mapItem({ ...data, media_type: type });
    return { ...item, classification, trailer };
  }

  async _processBatch(items) {
    const promises = items.map(async (item) => {
      try {
        const mappedItem = this._mapItem(item);
        const { data } = await tmdbApi.get(
          `/${mappedItem.type}/${mappedItem.id}`,
          {
            params: {
              append_to_response:
                mappedItem.type === "movie"
                  ? "release_dates,videos"
                  : "content_ratings,videos",
            },
          }
        );

        const classification = this._extractClassification(
          mappedItem.type,
          mappedItem.type === "movie"
            ? data.release_dates
            : data.content_ratings
        );
        if (!classification) return null;

        const trailer = this._extractTrailer(data.videos);

        return {
          ...mappedItem,
          classification,
          trailer,
        };
      } catch (error) {
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter((item) => item !== null);
  }

  searchBookmarkedItems(items, query) {
    const lowerQuery = query.toLowerCase();
    return items.filter((item) =>
      item.title?.toLowerCase().includes(lowerQuery)
    );
  }

  _extractClassification(type, data) {
    if (type === "movie") {
      const results = data?.results || [];
      const pick = results.find((r) => r.iso_3166_1 === "US");
      const rels = pick?.release_dates || [];
      const withCert = rels.find(
        (r) => r.certification && r.certification.trim()
      );
      return withCert?.certification || null;
    } else {
      const results = data?.results || [];
      const pick = results.find((r) => r.iso_3166_1 === "US") || results[0];
      return pick?.rating || null;
    }
  }

  _extractTrailer(data) {
    const videos = Array.isArray(data?.results) ? data.results : [];
    if (videos.length === 0) return null;

    const priority = { Trailer: 1, Teaser: 2, Clip: 3 };

    const candidates = videos
      .filter(
        (v) =>
          v?.key &&
          (v?.type === "Trailer" ||
            v?.type === "Teaser" ||
            v?.type === "Clip") &&
          v?.site === "YouTube"
      )
      .sort((a, b) => {
        if (a.official && !b.official) return -1;
        if (!a.official && b.official) return 1;
        return priority[a.type] - priority[b.type];
      });

    const bestVideo = candidates[0];
    return bestVideo?.key
      ? `${YT_EMBED_BASE}${bestVideo.key}?autoplay=1&rel=0`
      : null;
  }

  _mapItem(item) {
    const path = item?.backdrop_path || item?.poster_path || "";
    const title =
      item?.title ||
      item?.name ||
      item?.original_title ||
      item?.original_name ||
      "";
    const dateStr = item?.release_date || item?.first_air_date || "";
    const year = dateStr ? String(dateStr).slice(0, 4) : "";

    return {
      id: item?.id,
      imgDefault: path ? imgDefault(path) : "",
      imgTrending: path ? imgTrending(path) : "",
      type: item?.media_type,
      release_date: year,
      title,
      popularity: item?.popularity,
    };
  }
}
