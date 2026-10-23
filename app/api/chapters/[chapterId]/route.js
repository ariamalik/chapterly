import { NextResponse } from "next/server";

import { currentWriter } from "@/lib/auth";
import { query } from "@/lib/db";
import { touchStory } from "@/lib/stories";

async function ownedChapter(chapterId, writerId) {
  const { rows } = await query(
    `select c.id, c.story_id, c.title, c.body, c.published_at
       from chapters c
       join stories s on s.id = c.story_id
      where c.id = $1 and s.writer_id = $2`,
    [chapterId, writerId],
  );
  return rows[0] ?? null;
}

export async function PATCH(request, { params }) {
  const writer = await currentWriter();
  if (!writer) {
    return NextResponse.json({ error: "You need to sign in." }, { status: 401 });
  }

  const { chapterId } = await params;
  const chapter = await ownedChapter(chapterId, writer.id);
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found." }, { status: 404 });
  }

  const payload = await request.json().catch(() => ({}));
  const title =
    typeof payload.title === "string" ? payload.title.trim() : chapter.title;
  const body =
    typeof payload.body === "string" ? payload.body : chapter.body;

  if (title.length < 2) {
    return NextResponse.json(
      { error: "Chapter titles need at least 2 characters." },
      { status: 400 },
    );
  }

  let publishedAt = chapter.published_at;
  if (typeof payload.published === "boolean") {
    publishedAt = payload.published ? (chapter.published_at ?? new Date()) : null;
  }

  await query(
    `update chapters
        set title = $1, body = $2, published_at = $3, updated_at = now()
      where id = $4`,
    [title, body, publishedAt, chapter.id],
  );

  await touchStory(chapter.story_id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const writer = await currentWriter();
  if (!writer) {
    return NextResponse.json({ error: "You need to sign in." }, { status: 401 });
  }

  const { chapterId } = await params;
  const chapter = await ownedChapter(chapterId, writer.id);
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found." }, { status: 404 });
  }

  await query(`delete from chapters where id = $1`, [chapter.id]);
  await touchStory(chapter.story_id);
  return NextResponse.json({ ok: true });
}
