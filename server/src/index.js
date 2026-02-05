import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoute from "./routes/health.js";
import navRoute from "./routes/nav.js";
import driveRoute from "./routes/drive.js";
import sheetsRoute from "./routes/sheets.js";
import { verifyDbConnection } from "./db/pool.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware
 */
app.use(express.json());

// If you use Vite's proxy (recommended), CORS isn't necessary in dev.
// Keeping it enabled is harmless for local testing and helpful in non-proxy setups.
app.use(
  cors({
    origin: ["http://localhost:5173"], // Vite default dev server
    credentials: true
  })
);

/**
 * API routes
 */
app.use("/api/health", healthRoute);
app.use("/api/nav", navRoute);
app.use("/api/drive", driveRoute);
app.use("/api/sheets", sheetsRoute);

// Base test route
app.get("/api", (_req, res) => res.json({ message: "API is running" }));

/**
 * Start server
 */
app.listen(PORT, async () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
  console.log(`📂 Google Drive API available at /api/drive/events`);
  console.log(`📊 Google Sheets API available at /api/sheets/rsvp/:spreadsheetId`);
  try {
    const now = await verifyDbConnection();
    console.log("✅ DB connection OK at:", now);
  } catch (err) {
    console.log("⚠️ DB connection failed:", err.message);
    console.log("⚠️ Server will continue without database");
  }
});
