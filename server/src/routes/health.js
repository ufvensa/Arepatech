import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

/**
 * GET /api/health
 * Confirms API is up and DB is reachable.
 */
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT NOW() AS now");
    res.json({
      ok: true,
      api: "up",
      dbTime: rows[0].now
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, api: "up", db: "down", error: err.message });
  }
});

export default router;