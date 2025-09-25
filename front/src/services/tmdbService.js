import { tmdbApi, imgTrending, imgDefault } from "@/api/tmdbApi";
const YT_EMBED_BASE = "https://www.youtube.com/embed/";
export default class TmdbService {
  async getTrending(time = "week", limit = 10, params = {}) {
    const results = [];
    let page = 1;

    do {
      const { data } = await tmdbApi.get(`/trending/all/${time}`, {
        params: { page, ...params },
      });

      if ((data?.results ?? []).length === 0) break;

      const filtered = (data.results || []).filter(
        (item) =>
          (item.media_type === "movie" || item.media_type === "tv") &&
          Number(item?.popularity) >= 1
      );

      for (const item of filtered) {
        results.push(this._mapItem(item));
        if (results.length >= limit) break;
      }

      page += 1;
    } while (results.length < limit);

    await this._addClassification(results);
    await this._addTrailer(results);

    return results;
  }

  async getCurrentlyList(type, limit = 10, params = {}) {
    const results = [];
    let page = 1;
    let path;

    if (type === "movie") {
      path = "/movie/now_playing";
    } else if (type === "tv") {
      path = "/tv/on_the_air";
    } else return;

    const { data } = await tmdbApi.get(`${path}`, {
      params: { page, ...params },
    });

    if ((data?.results ?? []).length === 0) return;

    for (const item of data.results) {
      results.push(this._mapItem({ ...item, media_type: type }));
      if (results.length >= limit) break;
    }

    await this._addClassification(results);
    await this._addTrailer(results);

    return results;
  }

  async searchMulti(query, page = 1, params = {}) {
    const results = [];
    let currentPage = page;

    do {
      const { data } = await tmdbApi.get("/search/multi", {
        params: {
          query,
          page: currentPage,
          ...params,
        },
      });
      if ((data?.results ?? []).length === 0) break;

      const filtered = (data.results || []).filter(
        (item) =>
          (item.media_type === "movie" || item.media_type === "tv") &&
          Number(item?.popularity) >= 1
      );
      for (const item of filtered) {
        results.push(this._mapItem(item));
      }

      currentPage += 1;
    } while (currentPage <= 3);

    await this._addClassification(results);
    await this._addTrailer(results);

    results.sort((a, b) => b.popularity - a.popularity);
    return results;
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

  async _addClassification(items) {
    await Promise.all(
      items.map(async (item) => {
        try {
          if (item.type === "movie") {
            item.classification = await this._getMovieCertification(item.id);
          } else if (item.type === "tv") {
            item.classification = await this._getTvContentRating(item.id);
          } else {
            item.classification = null;
          }
        } catch (_) {
          item.classification = null;
        }
      })
    );
    return items;
  }

  async _addTrailer(items) {
    await Promise.all(
      items.map(async (item) => {
        try {
          if (item.type === "movie" || item.type === "tv") {
            item.trailer = await this._getTrailerKey(item.type, item.id);
          } else {
            item.trailer = null;
          }
        } catch (error) {
          item.trailer = null;
        }
      })
    );
    return items;
  }

  async _getTrailerKey(type, id) {
    const { data } = await tmdbApi.get(`/${type}/${id}/videos`);
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

  async _getMovieCertification(id) {
    const { data } = await tmdbApi.get(`/movie/${id}/release_dates`);
    const results = data?.results || [];
    const pick = results.find((r) => r.iso_3166_1 === "US") || results[0];

    const rels = pick?.release_dates || [];
    const withCert = rels.find(
      (r) => r.certification && r.certification.trim()
    );
    return withCert?.certification || null;
  }

  async _getTvContentRating(id) {
    const { data } = await tmdbApi.get(`/tv/${id}/content_ratings`);
    const results = data?.results || [];
    const pick = results.find((r) => r.iso_3166_1 === "US") || results[0];
    return pick?.rating || null;
  }
}
