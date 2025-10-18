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
const CDN_CACHE_HEADER =
  "public, s-maxage=43200, stale-while-revalidate=60, max-age=0";

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
  await Promise.all(jobs);
}

async function warmCdnFromCache(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const origin = `${proto}://${host}`;
  const base = req.baseUrl || "";

  const keys = cache.keys();
  if (!keys.length) return;

  await Promise.allSettled(
    keys.map((k) =>
      fetch(`${origin}${base}${k}`, {
        headers: { "x-prefetch-warm": "1" },
      })
    )
  );
}

router.get("/prefetch", async (req, res) => {
  const isCron = req.headers["x-vercel-cron"] === "1";
  const auth = req.headers.authorization || req.headers.Authorization;
  const okAuth = isCron || auth === `Bearer ${process.env.CRON_SECRET}`;
  if (!okAuth) return res.status(401).json({ error: "Unauthorized" });

  try {
    await runAllPrefetch();
    await warmCdnFromCache(req);
    return res.status(200).json({ ok: true, message: "Prefetch completed" });
  } catch (error) {
    console.error("[Prefetch] Vercel cron prefetch failed:", error);
    return res.status(500).json({ ok: false, error: String(error) });
  }
});

router.get(/.*/, async (req, res) => {
  const cacheKey = req.url;
  const cached = cache.get(cacheKey);
  if (cached) {
    if (cached.contentType) res.set("Content-Type", cached.contentType);
    res.set("Cache-Control", CDN_CACHE_HEADER);
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

    if (tmdbResponse.ok) cache.set(cacheKey, { contentType, body });

    if (contentType) res.set("Content-Type", contentType);
    res.set("Cache-Control", CDN_CACHE_HEADER);
    return res.status(200).send(body);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `[TMDB Proxy Error] ${req.url}: ${error}` });
  }
});

export default router;
