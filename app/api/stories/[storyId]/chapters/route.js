import { NextResponse } from "next/server";

import { currentWriter } from "@/lib/auth";
import { query } from "@/lib/db";
import { getOwnedStory, touchStory } from "@/lib/stories";

export async function POST(request, { params }) {
  const writer = await currentWriter();
  if (!writer) {
    return NextResponse.json({ error: "You need to sign in." }, { status: 401 });
  }

  const { storyId } = await params;
  const story = await getOwnedStory(storyId, writer.id);
  if (!story) {
    return NextResponse.json({ error: "Story not found." }, { status: 404 });
  }

  const payload = await request.json().catch(() => ({}));
  const title = String(payload.title ?? "").trim();
  const body = String(payload.body ?? "");

  if (title.length < 2) {
    return NextResponse.json(
      { error: "Chapter titles need at least 2 characters." },
      { status: 400 },
    );
  }

  const { rows } = await query(
    `select coalesce(max(position), 0) + 1 as next_position
       from chapters where story_id = $1`,
    [story.id],
  );

  const { rows: created } = await query(
    `insert into chapters (story_id, title, body, position)
     values ($1, $2, $3, $4)
     returning id, position`,
    [story.id, title, body, rows[0].next_position],
  );

  await touchStory(story.id);

  return NextResponse.json({
    ok: true,
    id: created[0].id,
    position: created[0].position,
  });
}
