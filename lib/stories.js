import { query } from "@/lib/db";

export function slugify(title) {
  const base = String(title ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-$/, "");
  return base || "story";
}

export async function uniqueSlug(title) {
  const base = slugify(title);
  let candidate = base;
  for (let n = 2; n <= 40; n += 1) {
    const { rowCount } = await query(`select 1 from stories where slug = $1`, [
      candidate,
    ]);
    if (!rowCount) return candidate;
    candidate = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

/** The public shelf: published stories only, newest activity first. */
export async function listPublishedStories() {
  const { rows } = await query(
    `select s.id, s.title, s.slug, s.synopsis, s.updated_at, w.pen_name,
            count(c.id) filter (where c.published_at is not null) as chapter_count
       from stories s
       join writers w on w.id = s.writer_id
       left join chapters c on c.story_id = s.id
      where s.status = 'published'
      group by s.id, w.pen_name
      order by s.updated_at desc`,
  );
  return rows;
}

/** A story for the public reader, with its published chapters in order. */
export async function getStoryBySlug(slug) {
  const { rows } = await query(
    `select s.id, s.title, s.slug, s.synopsis, s.status, s.writer_id,
            s.updated_at, w.pen_name
       from stories s
       join writers w on w.id = s.writer_id
      where s.slug = $1`,
    [slug],
  );
  const story = rows[0];
  if (!story) return null;

  const { rows: chapters } = await query(
    `select id, title, body, position, published_at
       from chapters
      where story_id = $1 and published_at is not null
      order by position`,
    [story.id],
  );
  return { ...story, chapters };
}

/** Every story a writer owns, drafts included. */
export async function listStoriesForOwner(writerId) {
  const { rows } = await query(
    `select s.id, s.title, s.slug, s.synopsis, s.status, s.updated_at,
            count(c.id) as chapter_count,
            count(c.id) filter (where c.published_at is not null) as published_count
       from stories s
       left join chapters c on c.story_id = s.id
      where s.writer_id = $1
      group by s.id
      order by s.updated_at desc`,
    [writerId],
  );
  return rows;
}

/** One owned story with every chapter, drafts included. */
export async function getStoryForOwner(storyId, writerId) {
  const { rows } = await query(
    `select id, title, slug, synopsis, status
       from stories
      where id = $1 and writer_id = $2`,
    [storyId, writerId],
  );
  const story = rows[0];
  if (!story) return null;

  const { rows: chapters } = await query(
    `select id, title, body, position, published_at
       from chapters
      where story_id = $1
      order by position`,
    [story.id],
  );
  return { ...story, chapters };
}

/** Ownership gate for write endpoints. */
export async function getOwnedStory(storyId, writerId) {
  const { rows } = await query(
    `select id, slug, title from stories where id = $1 and writer_id = $2`,
    [storyId, writerId],
  );
  return rows[0] ?? null;
}

export async function touchStory(storyId) {
  await query(`update stories set updated_at = now() where id = $1`, [storyId]);
}
