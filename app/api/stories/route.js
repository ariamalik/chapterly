import { NextResponse } from "next/server";

import { currentWriter } from "@/lib/auth";
import { query } from "@/lib/db";
import { uniqueSlug } from "@/lib/stories";

export async function POST(request) {
  const writer = await currentWriter();
  if (!writer) {
    return NextResponse.json({ error: "You need to sign in." }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  const title = String(payload.title ?? "").trim();
  const synopsis = String(payload.synopsis ?? "").trim();

  if (title.length < 2) {
    return NextResponse.json(
      { error: "Give your story a title of at least 2 characters." },
      { status: 400 },
    );
  }

  const slug = await uniqueSlug(title);
  const { rows } = await query(
    `insert into stories (writer_id, title, slug, synopsis)
     values ($1, $2, $3, $4)
     returning id`,
    [writer.id, title, slug, synopsis],
  );

  return NextResponse.json({ id: rows[0].id, slug });
}
