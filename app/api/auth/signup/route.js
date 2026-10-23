import { NextResponse } from "next/server";

import { createSession, hashPassword } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  const email = String(payload.email ?? "")
    .trim()
    .toLowerCase();
  const penName = String(payload.pen_name ?? "").trim();
  const password = String(payload.password ?? "");

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }
  if (penName.length < 2) {
    return NextResponse.json(
      { error: "Your pen name needs at least 2 characters." },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Passwords need at least 8 characters." },
      { status: 400 },
    );
  }

  const existing = await query(`select id from writers where email = $1`, [
    email,
  ]);
  if (existing.rowCount) {
    return NextResponse.json(
      { error: "That email is already registered. Sign in instead." },
      { status: 409 },
    );
  }

  const { rows } = await query(
    `insert into writers (email, pen_name, password_hash)
     values ($1, $2, $3)
     returning id`,
    [email, penName, hashPassword(password)],
  );

  await createSession(rows[0].id);
  return NextResponse.json({ ok: true });
}
