import { NextResponse } from "next/server";

import { createSession, verifyPassword } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  const email = String(payload.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(payload.password ?? "");

  const { rows } = await query(
    `select id, password_hash from writers where email = $1`,
    [email],
  );
  const writer = rows[0];

  if (!writer || !verifyPassword(password, writer.password_hash)) {
    return NextResponse.json(
      { error: "That email and password do not match." },
      { status: 401 },
    );
  }

  await createSession(writer.id);
  return NextResponse.json({ ok: true });
}
