import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://chapterly:chapterly@localhost:5432/chapterly";

// Reuse one pool across hot reloads instead of opening a new one per edit.
const globalForDb = globalThis;

export const pool =
  globalForDb.__chapterlyPool ?? new Pool({ connectionString, max: 10 });

if (!globalForDb.__chapterlyPool) {
  globalForDb.__chapterlyPool = pool;
}

export function query(text, params) {
  return pool.query(text, params);
}
