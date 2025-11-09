import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

let pool = null;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.PGSSLMODE &&
      process.env.PGSSLMODE.toLowerCase() === "require"
        ? { rejectUnauthorized: false }
        : false
  });
} catch (err) {
  console.log("PostgreSQL not configured yet — skipping DB connection.");
}

export { pool };
export async function verifyDbConnection() {
  if (!pool) return "No database configured yet";
  const { rows } = await pool.query("SELECT NOW() AS now");
  return rows[0].now;
}