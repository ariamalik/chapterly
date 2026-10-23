import Link from "next/link";
import { notFound } from "next/navigation";

import StatusPill from "@/components/StatusPill";
import { currentWriter } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getStoryBySlug } from "@/lib/stories";

export const dynamic = "force-dynamic";

export default async function StoryPage({ params }) {
  const { slug } = await params;
  const writer = await currentWriter();
  const story = await getStoryBySlug(slug);

  if (!story) notFound();

  const isOwner = writer?.id === story.writer_id;
  if (story.status !== "published" && !isOwner) notFound();

  return (
    <>
      <header className="story-head">
        <p className="eyebrow">{story.pen_name}</p>
        <h1>{story.title}</h1>
        {story.synopsis ? <p className="synopsis">{story.synopsis}</p> : null}
        <p className="meta muted small">
          {story.status === "published" ? (
            <StatusPill tone="live">published</StatusPill>
          ) : (
            <StatusPill>draft</StatusPill>
          )}{" "}
          {story.chapters.length}{" "}
          {story.chapters.length === 1 ? "chapter" : "chapters"} · updated{" "}
          {formatDate(story.updated_at)}
        </p>
        {isOwner ? (
          <p>
            <Link href={`/dashboard/${story.id}`} className="btn btn-sm">
              Manage this story
            </Link>
          </p>
        ) : null}
      </header>

      <section>
        <div className="section-head">
          <h2>Chapters</h2>
        </div>

        {story.chapters.length ? (
          <ol className="chapter-list">
            {story.chapters.map((chapter) => (
              <li key={chapter.id}>
                <Link
                  href={`/stories/${story.slug}/chapter/${chapter.position}`}
                >
                  {chapter.title}
                </Link>
                <span className="muted small">
                  {formatDate(chapter.published_at)}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty">
            No chapters published yet.{" "}
            {isOwner ? (
              <Link href={`/dashboard/${story.id}`}>Add the first chapter</Link>
            ) : (
              "Check back soon."
            )}
          </p>
        )}
      </section>
    </>
  );
}
