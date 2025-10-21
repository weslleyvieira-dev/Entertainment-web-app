import { Router } from "express";
import { createClient } from "@vercel/kv";
import {
  prefetchTrending,
  prefetchPopular,
  prefetchCurrentlyList,
} from "../utils/tmdbPrefetch.js";

const router = Router();
const TMDB_BASE = "https://api.themoviedb.org/3";
const CACHE_TTL_SECONDS = 43200;

const kvClient = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const KV_PREFIX = `tmdb:${
  process.env.VERCEL_PROJECT_PRODUCTION_URL || "shared"
}:${process.env.VERCEL_ENV || "local"}`;

const cache = {
  get: async (key) => {
    try {
      return await kvClient.get(`${KV_PREFIX}:${key}`);
    } catch (error) {
      console.error("[KV] get fail:", error?.message || error);
      return null;
    }
  },
  set: async (key, value, ttl) => {
    try {
      return await kvClient.set(`${KV_PREFIX}:${key}`, value, { ex: ttl });
    } catch (error) {
      console.error("[KV] set fail:", error?.message || error);
    }
  },
  ttl: async (key) => {
    try {
      return await kvClient.ttl(`${KV_PREFIX}:${key}`);
    } catch (error) {
      console.error("[KV] ttl fail:", error?.message || error);
      return null;
    }
  },
};

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

router.get("/prefetch", async (req, res) => {
  if (!req.headers["x-vercel-cron"]) {
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
  const cacheKey = req.url;
  const cached = await cache.get(cacheKey);
  if (cached) {
    if (cached.contentType) res.set("Content-Type", cached.contentType);
    const ttlSec = await cache.ttl(cacheKey);
    const remaining = ttlSec && ttlSec > 0 ? ttlSec : CACHE_TTL_SECONDS;
    res.set("Cache-Control", `public, max-age=${remaining}`);
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
      await cache.set(cacheKey, { contentType, body }, CACHE_TTL_SECONDS);
      if (contentType) res.set("Content-Type", contentType);
      res.set("Cache-Control", `public, max-age=${CACHE_TTL_SECONDS}`);
      return res.status(200).send(body);
    }

    if (contentType) res.set("Content-Type", contentType);
    const status = tmdbResponse.status || 502;
    try {
      const parsed = JSON.parse(body);
      return res.status(status).json({
        error: `[TMDB Proxy Error] ${req.url}`,
        details: parsed,
      });
    } catch {
      return res.status(status).send(body);
    }
  } catch (error) {
    console.error("[TMDB Proxy] Request failed:", error);
    return res
      .status(500)
      .json({ error: `[TMDB Proxy Error] ${req.url}`, details: String(error) });
  }
});

export default router;
