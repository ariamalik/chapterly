import { NextResponse } from "next/server";

import { currentWriter } from "@/lib/auth";
import { query } from "@/lib/db";
import { getOwnedStory } from "@/lib/stories";

export async function PATCH(request, { params }) {
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
  const updates = [];
  const values = [];

  if (typeof payload.title === "string") {
    const title = payload.title.trim();
    if (title.length < 2) {
      return NextResponse.json(
        { error: "Story titles need at least 2 characters." },
        { status: 400 },
      );
    }
    values.push(title);
    updates.push(`title = $${values.length}`);
  }

  if (typeof payload.synopsis === "string") {
    values.push(payload.synopsis.trim());
    updates.push(`synopsis = $${values.length}`);
  }

  if (typeof payload.status === "string") {
    if (!["draft", "published"].includes(payload.status)) {
      return NextResponse.json(
        { error: "Unknown story status." },
        { status: 400 },
      );
    }
    values.push(payload.status);
    updates.push(`status = $${values.length}`);
  }

  if (!updates.length) {
    return NextResponse.json(
      { error: "Nothing to update." },
      { status: 400 },
    );
  }

  updates.push("updated_at = now()");
  values.push(story.id);

  await query(
    `update stories set ${updates.join(", ")} where id = $${values.length}`,
    values,
  );

  return NextResponse.json({ ok: true, slug: story.slug });
}

export async function DELETE(request, { params }) {
  const writer = await currentWriter();
  if (!writer) {
    return NextResponse.json({ error: "You need to sign in." }, { status: 401 });
  }

  const { storyId } = await params;
  const story = await getOwnedStory(storyId, writer.id);
  if (!story) {
    return NextResponse.json({ error: "Story not found." }, { status: 404 });
  }

  await query(`delete from stories where id = $1`, [story.id]);
  return NextResponse.json({ ok: true });
}
