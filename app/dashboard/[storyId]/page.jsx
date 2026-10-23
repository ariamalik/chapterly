import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import ActionButton from "@/components/ActionButton";
import ChapterForm from "@/components/ChapterForm";
import StatusPill from "@/components/StatusPill";
import StoryForm from "@/components/StoryForm";
import { currentWriter } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getStoryForOwner } from "@/lib/stories";

export const dynamic = "force-dynamic";

export default async function ManageStoryPage({ params }) {
  const writer = await currentWriter();
  if (!writer) redirect("/signin?notice=Sign in to manage your stories.");

  const { storyId } = await params;
  const story = await getStoryForOwner(storyId, writer.id);
  if (!story) notFound();

  const published = story.status === "published";

  return (
    <>
      <p className="eyebrow">
        <Link href="/dashboard">Writing desk</Link>
      </p>

      <div className="page-head">
        <div>
          <h1>{story.title}</h1>
          <p className="meta muted small">
            <StatusPill tone={published ? "live" : ""}>{story.status}</StatusPill>{" "}
            {story.chapters.length}{" "}
            {story.chapters.length === 1 ? "chapter" : "chapters"}
          </p>
        </div>
        <div className="meta">
          {published ? (
            <Link href={`/stories/${story.slug}`} className="btn btn-sm">
              View public page
            </Link>
          ) : null}
          <ActionButton
            label={published ? "Unpublish story" : "Publish story"}
            method="PATCH"
            url={`/api/stories/${story.id}`}
            body={{ status: published ? "draft" : "published" }}
            variant="primary"
            size="sm"
          />
          <ActionButton
            label="Delete story"
            confirmText="Confirm delete"
            method="DELETE"
            url={`/api/stories/${story.id}`}
            redirectTo="/dashboard"
            variant="danger"
            size="sm"
          />
        </div>
      </div>

      <section className="panel">
        <h2>Story details</h2>
        <StoryForm story={story} />
      </section>

      <section style={{ marginTop: "2rem" }}>
        <div className="section-head">
          <h2>Chapters</h2>
          <span className="muted small">
            {story.chapters.filter((c) => c.published_at).length} live
          </span>
        </div>

        {story.chapters.length ? (
          <ul className="chapter-list">
            {story.chapters.map((chapter) => (
              <li key={chapter.id}>
                <span>
                  <span className="muted small">{chapter.position}. </span>
                  <Link
                    href={`/dashboard/${story.id}/chapters/${chapter.id}`}
                  >
                    {chapter.title}
                  </Link>
                </span>
                <span className="meta">
                  {chapter.published_at ? (
                    <StatusPill tone="live">live</StatusPill>
                  ) : (
                    <StatusPill>unpublished</StatusPill>
                  )}
                  <ActionButton
                    label={chapter.published_at ? "Unpublish" : "Publish"}
                    method="PATCH"
                    url={`/api/chapters/${chapter.id}`}
                    body={{ published: !chapter.published_at }}
                    size="sm"
                  />
                  <ActionButton
                    label="Delete"
                    confirmText="Confirm delete"
                    method="DELETE"
                    url={`/api/chapters/${chapter.id}`}
                    variant="danger"
                    size="sm"
                  />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">No chapters yet — add the first one below.</p>
        )}
      </section>

      <section className="panel" style={{ marginTop: "2rem" }}>
        <h2>Add a chapter</h2>
        <p className="muted small">
          New chapters stay unpublished until you publish them.
        </p>
        <ChapterForm storyId={story.id} />
      </section>

      <p className="muted small">
        Created {formatDate(story.updated_at)} · draft chapters are only visible
        to you until published.
      </p>
    </>
  );
}
