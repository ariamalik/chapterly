import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import ActionButton from "@/components/ActionButton";
import ChapterForm from "@/components/ChapterForm";
import StatusPill from "@/components/StatusPill";
import { currentWriter } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getStoryForOwner } from "@/lib/stories";

export const dynamic = "force-dynamic";

export default async function EditChapterPage({ params }) {
  const writer = await currentWriter();
  if (!writer) redirect("/signin?notice=Sign in to edit your chapters.");

  const { storyId, chapterId } = await params;
  const story = await getStoryForOwner(storyId, writer.id);
  if (!story) notFound();

  const chapter = story.chapters.find(
    (entry) => String(entry.id) === String(chapterId),
  );
  if (!chapter) notFound();

  return (
    <>
      <p className="eyebrow">
        <Link href="/dashboard">Writing desk</Link> ·{" "}
        <Link href={`/dashboard/${story.id}`}>{story.title}</Link>
      </p>

      <div className="page-head">
        <div>
          <h1>Chapter {chapter.position}</h1>
          <p className="meta muted small">
            {chapter.published_at ? (
              <>
                <StatusPill tone="live">live</StatusPill> published{" "}
                {formatDate(chapter.published_at)}
              </>
            ) : (
              <StatusPill>unpublished</StatusPill>
            )}
          </p>
        </div>
        <div className="meta">
          {chapter.published_at ? (
            <Link
              href={`/stories/${story.slug}/chapter/${chapter.position}`}
              className="btn btn-sm"
            >
              Read it
            </Link>
          ) : null}
          <ActionButton
            label={chapter.published_at ? "Unpublish" : "Publish"}
            method="PATCH"
            url={`/api/chapters/${chapter.id}`}
            body={{ published: !chapter.published_at }}
            variant="primary"
            size="sm"
          />
          <ActionButton
            label="Delete chapter"
            confirmText="Confirm delete"
            method="DELETE"
            url={`/api/chapters/${chapter.id}`}
            redirectTo={`/dashboard/${story.id}`}
            variant="danger"
            size="sm"
          />
        </div>
      </div>

      <ChapterForm storyId={story.id} chapter={chapter} />
    </>
  );
}
