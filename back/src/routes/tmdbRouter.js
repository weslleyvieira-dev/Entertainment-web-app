import { Router } from "express";
import NodeCache from "node-cache";
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

router.get("/prefetch", async (req, res) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await runAllPrefetch();
    return res.status(200).json({ ok: true, message: "Prefetch completed" });
  } catch (error) {
    console.error("[Prefetch] Vercel cron prefetch failed:", error);
    return res.status(500).json({ ok: false, error: String(error) });
  }
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
