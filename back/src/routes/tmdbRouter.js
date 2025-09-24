import { Router } from "express";

const router = Router();
const TMDB_BASE = "https://api.themoviedb.org/3";

router.use(async (req, res) => {
  try {
    const url = `${TMDB_BASE}${req.url}`;

    const tmdbResponse = await fetch(url, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      },
    });

    const contentType = tmdbResponse.headers.get("content-type");
    if (contentType) res.set("Content-Type", contentType);

    const body = await tmdbResponse.text();
    res.status(200).send(body);
  } catch {
    res.status(500).json({ error: "TMDB proxy error." });
  }
});

export default router;
