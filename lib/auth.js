import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { query } from "@/lib/db";

export const SESSION_COOKIE = "chapterly_session";
const SESSION_DAYS = 30;

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored ?? "").split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

export function newToken() {
  return randomBytes(32).toString("hex");
}

/** The signed-in writer, or null. */
export async function currentWriter() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const { rows } = await query(
    `select w.id, w.email, w.pen_name
       from sessions s
       join writers w on w.id = s.writer_id
      where s.token = $1`,
    [token],
  );
  return rows[0] ?? null;
}

export async function createSession(writerId) {
  const token = newToken();
  await query(`insert into sessions (token, writer_id) values ($1, $2)`, [
    token,
    writerId,
  ]);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await query(`delete from sessions where token = $1`, [token]);
  }
  store.delete(SESSION_COOKIE);
}
