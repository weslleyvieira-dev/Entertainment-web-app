const TMDB_BASE = "https://api.themoviedb.org/3";

function authHeader() {
  const token = process.env.TMDB_TOKEN;
  return { Authorization: `Bearer ${token}` };
}

async function prefetchDetails(cache, items) {
  try {
    const errors = [];
    const jobs = items
      .filter((item) => {
        const type = item.media_type || item.type;
        return type === "movie" || type === "tv";
      })
      .map((item) => {
        const type = item.media_type || item.type;
        const detailUrl = `/${type}/${item.id}?append_to_response=${
          type === "movie" ? "release_dates,videos" : "content_ratings,videos"
        }`;
        return (async () => {
          try {
            const detailResponse = await fetch(`${TMDB_BASE}${detailUrl}`, {
              headers: { accept: "application/json", ...authHeader() },
            });
            const detailContentType =
              detailResponse.headers.get("content-type");
            const detailBody = await detailResponse.text();
            cache.set(detailUrl, {
              contentType: detailContentType,
              body: detailBody,
            });
          } catch (error) {
            errors.push(`[${item.id}] ${error?.message ?? String(error)}`);
          }
        })();
      });

    await Promise.allSettled(jobs);

    if (errors.length > 0) {
      const preview = errors.slice(0, 10).join("; ");
      throw new Error(
        `[PrefetchDetails Error] Failed to fetch details for ${errors.length} items: ${preview}`
      );
    }
  } catch (error) {
    throw new Error(
      `[PrefetchDetails Error] Failed to run prefetchDetails: ${
        error?.message ?? String(error)
      }`
    );
  }
}

export async function prefetchTrending(cache, type = "all") {
  try {
    const url = `/trending/${type}/week?page=1`;
    const tmdbResponse = await fetch(`${TMDB_BASE}${url}`, {
      headers: {
        accept: "application/json",
        ...authHeader(),
      },
    });
    const contentType = tmdbResponse.headers.get("content-type");
    const body = await tmdbResponse.text();
    cache.set(url, { contentType, body });

    try {
      const data = JSON.parse(body);
      let items = data.results || [];

      if (type === "movie" || type === "tv") {
        items = items.map((item) => ({ ...item, type }));
      } else {
        items = items.filter(
          (item) => item.media_type === "movie" || item.media_type === "tv"
        );
      }

      await prefetchDetails(cache, items);
    } catch (error) {
      throw new Error(
        `[PrefetchTrending Error] Failed to process details for trending (${type}): ${
          error?.message ?? String(error)
        }`
      );
    }
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
      headers: {
        accept: "application/json",
        ...authHeader(),
      },
    });
    const contentType = tmdbResponse.headers.get("content-type");
    const body = await tmdbResponse.text();
    cache.set(url, { contentType, body });

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
      headers: {
        accept: "application/json",
        ...authHeader(),
      },
    });
    const contentType = tmdbResponse.headers.get("content-type");
    const body = await tmdbResponse.text();
    cache.set(url, { contentType, body });

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
