import { Router } from "express";
import NodeCache from "node-cache";
import cron from "node-cron";
import {
  prefetchTrending,
  prefetchPopular,
  prefetchCurrentlyList,
} from "../utils/tmdbPrefetch.js";

const router = Router();
const TMDB_BASE = "https://api.themoviedb.org/3";
const cache = new NodeCache({ stdTTL: 43200 });

async function runAllPrefetch() {
  const jobs = [
    prefetchTrending(cache, "movie"),
    prefetchTrending(cache, "tv"),
    prefetchTrending(cache, "all"),
    prefetchPopular(cache, "movie"),
    prefetchPopular(cache, "tv"),
    prefetchCurrentlyList(cache, "movie"),
    prefetchCurrentlyList(cache, "tv"),
  ];
  try {
    await Promise.all(jobs);
  } catch (error) {
    throw new Error(
      `[Prefetch] Some prefetch jobs failed: ${error?.message ?? String(error)}`
    );
  }
}

runAllPrefetch().catch((err) => {
  console.error("[Prefetch] Initial prefetch failed:", err?.message ?? err);
});

cron.schedule("0 */12 * * *", () => {
  runAllPrefetch().catch((err) => {
    console.error("[Prefetch] Scheduled prefetch failed:", err?.message ?? err);
  });
});

router.use(async (req, res) => {
  const cacheKey = req.url + (req.query.page ? `?page=${req.query.page}` : "");
  const cached = cache.get(cacheKey);
  if (cached) {
    res.set("Content-Type", cached.contentType);
    return res.status(200).send(cached.body);
  }
  try {
    const url = `${TMDB_BASE}${req.url}`;
    const tmdbResponse = await fetch(url, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      },
    });
    const contentType = tmdbResponse.headers.get("content-type");
    const body = await tmdbResponse.text();
    if (tmdbResponse.ok) {
      cache.set(cacheKey, { contentType, body });
    }
    if (contentType) res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=43200");
    return res.status(200).send(body);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `[TMDB Proxy Error] ${req.url}:`, error });
  }
});

export default router;
