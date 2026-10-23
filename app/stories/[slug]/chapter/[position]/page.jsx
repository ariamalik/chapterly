import Link from "next/link";
import { notFound } from "next/navigation";

import { currentWriter } from "@/lib/auth";
import { getStoryBySlug } from "@/lib/stories";

export const dynamic = "force-dynamic";

export default async function ChapterPage({ params }) {
  const { slug, position } = await params;
  const writer = await currentWriter();
  const story = await getStoryBySlug(slug);

  if (!story) notFound();

  const isOwner = writer?.id === story.writer_id;
  if (story.status !== "published" && !isOwner) notFound();

  const number = Number(position);
  const index = story.chapters.findIndex((chapter) => chapter.position === number);
  if (index === -1) notFound();

  const chapter = story.chapters[index];
  const previous = story.chapters[index - 1];
  const next = story.chapters[index + 1];

  return (
    <article className="reader">
      <p className="eyebrow">
        <Link href={`/stories/${story.slug}`}>{story.title}</Link>
      </p>
      <h1>{chapter.title}</h1>
      <p className="muted small">by {story.pen_name}</p>

      <div className="chapter-body">{chapter.body}</div>

      <nav className="chapter-nav">
        {previous ? (
          <Link
            href={`/stories/${story.slug}/chapter/${previous.position}`}
            className="btn btn-sm"
          >
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/stories/${story.slug}/chapter/${next.position}`}
            className="btn btn-sm"
          >
            {next.title} →
          </Link>
        ) : (
          <span className="muted small">
            You are up to date with this story.
          </span>
        )}
      </nav>
    </article>
  );
}
