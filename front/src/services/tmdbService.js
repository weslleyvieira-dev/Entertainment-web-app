import { tmdbApi, imgTrending, imgDefault } from "@/api/tmdbApi";
const YT_EMBED_BASE = "https://www.youtube.com/embed/";
export default class TmdbService {
  async getTrending(limit = 10, params = {}) {
    const results = [];
    const startPage = 1;
    let page = startPage;

    do {
      const { data } = await tmdbApi.get(`/trending/all/week`, {
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
    } while (results.lenght < 20);

    await this._addClassification(results);
    await this._addTrailer(results);

    return results;
  }

  async getImages(mediaType, id, params = {}) {
    const { data } = await tmdbApi.get(`/${mediaType}/${id}/images`, {
      params: { ...params },
    });
    return {
      ...data,
      backdrops: (data.backdrops || []).map((i) =>
        this._withImages(i, i.file_path)
      ),
      posters: (data.posters || []).map((i) =>
        this._withImages(i, i.file_path)
      ),
    };
  }

  _mapResults(data) {
    if (!data) return data;
    if (Array.isArray(data.results)) {
      return { ...data, results: data.results.map((i) => this._mapItem(i)) };
    }
    return this._mapItem(data);
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
    };
  }

  _withImages(item, path) {
    return {
      ...item,
      imgTrending: path ? imgTrending(path) : "",
      imgDefault: path ? imgDefault(path) : "",
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

  async _getTrailerKey(mediaType, id) {
    const { data } = await tmdbApi.get(`/${mediaType}/${id}/videos`);

    const videos = Array.isArray(data?.results) ? data.results : [];
    if (videos.length === 0) return null;

    const isCandidate = (v) =>
      v?.key &&
      (v?.type === "Trailer" || v?.type === "Teaser") &&
      v?.site === "YouTube" &&
      v?.official === true;

    const bestVideo = videos.find(isCandidate);
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
