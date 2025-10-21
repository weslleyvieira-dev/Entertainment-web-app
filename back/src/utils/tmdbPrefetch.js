const TMDB_BASE = "https://api.themoviedb.org/3";
const CACHE_TTL_SECONDS = 43200;

function authHeader() {
  const token = process.env.TMDB_TOKEN;
  return { Authorization: `Bearer ${token}` };
}

async function prefetchDetails(cache, items) {
  const jobs = items
    .filter((item) => {
      const type = item.media_type || item.type;
      return (type === "movie" || type === "tv") && item.id;
    })
    .map((item) => {
      const type = item.media_type || item.type;
      const detailUrl = `/${type}/${item.id}?append_to_response=${
        type === "movie" ? "release_dates,videos" : "content_ratings,videos"
      }`;
      return (async () => {
        const response = await fetch(`${TMDB_BASE}${detailUrl}`, {
          headers: { accept: "application/json", ...authHeader() },
        });
        const contentType = response.headers.get("content-type");
        const body = await response.text();
        await cache.set(detailUrl, { contentType, body }, CACHE_TTL_SECONDS);
      })();
    });

  await Promise.allSettled(jobs);
}

export async function prefetchTrending(cache, type = "all") {
  try {
    const url = `/trending/${type}/week?page=1`;
    const response = await fetch(`${TMDB_BASE}${url}`, {
      headers: { accept: "application/json", ...authHeader() },
    });
    const contentType = response.headers.get("content-type");
    const body = await response.text();
    await cache.set(url, { contentType, body }, CACHE_TTL_SECONDS);

    const data = JSON.parse(body);
    const items = (data.results || []).map((item) => ({
      ...item,
      type: item.media_type || type,
    }));
    await prefetchDetails(cache, items);
  } catch (error) {
    throw new Error(
      `[PrefetchTrending Error] Failed to fetch trending (${type}): ${
        error?.message ?? String(error)
      }`
    );
  }
}

export async function prefetchPopular(cache, type = "movie") {
  try {
    const url = `/discover/${type}?page=1`;
    const tmdbResponse = await fetch(`${TMDB_BASE}${url}`, {
      headers: { accept: "application/json", ...authHeader() },
    });
    const contentType = tmdbResponse.headers.get("content-type");
    const body = await tmdbResponse.text();
    await cache.set(url, { contentType, body }, CACHE_TTL_SECONDS);

    const data = JSON.parse(body);
    const items = (data.results || []).map((item) => ({ ...item, type }));
    await prefetchDetails(cache, items);
  } catch (error) {
    throw new Error(
      `[PrefetchPopular Error] Failed to prefetch popular (${type}): ${
        error?.message ?? String(error)
      }`
    );
  }
}

export async function prefetchCurrentlyList(cache, type) {
  try {
    let url;
    if (type === "movie") url = "/movie/now_playing?page=1";
    else if (type === "tv") url = "/tv/on_the_air?page=1";
    else return;

    const tmdbResponse = await fetch(`${TMDB_BASE}${url}`, {
      headers: { accept: "application/json", ...authHeader() },
    });
    const contentType = tmdbResponse.headers.get("content-type");
    const body = await tmdbResponse.text();
    await cache.set(url, { contentType, body }, CACHE_TTL_SECONDS);

    const data = JSON.parse(body);
    const items = (data.results || []).map((item) => ({ ...item, type }));
    await prefetchDetails(cache, items);
  } catch (error) {
    throw new Error(
      `[PrefetchCurrentlyList Error] Failed to prefetch currently list (${type}): ${
        error?.message ?? String(error)
      }`
    );
  }
}
