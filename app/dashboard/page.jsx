import Link from "next/link";
import { redirect } from "next/navigation";

import StatusPill from "@/components/StatusPill";
import { currentWriter } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { listStoriesForOwner } from "@/lib/stories";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const writer = await currentWriter();
  if (!writer) redirect("/signin?notice=Sign in to open your dashboard.");

  const stories = await listStoriesForOwner(writer.id);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Writing desk</p>
          <h1>{writer.pen_name}</h1>
          <p className="muted">
            {stories.length
              ? `${stories.length} ${
                  stories.length === 1 ? "story" : "stories"
                } in progress.`
              : "No stories yet — start your first serial."}
          </p>
        </div>
        <Link href="/dashboard/new" className="btn btn-primary">
          New story
        </Link>
      </div>

      {stories.length ? (
        <div className="stack">
          {stories.map((story) => (
            <div className="story-row" key={story.id}>
              <div>
                <h2>
                  <Link href={`/dashboard/${story.id}`}>{story.title}</Link>
                </h2>
                <p className="meta muted small">
                  <StatusPill tone={story.status === "published" ? "live" : ""}>
                    {story.status}
                  </StatusPill>
                  {Number(story.published_count)} of{" "}
                  {Number(story.chapter_count)}{" "}
                  {Number(story.chapter_count) === 1 ? "chapter" : "chapters"}{" "}
                  live · updated {formatDate(story.updated_at)}
                </p>
              </div>
              <div className="meta">
                {story.status === "published" ? (
                  <Link href={`/stories/${story.slug}`} className="btn btn-sm">
                    View
                  </Link>
                ) : null}
                <Link
                  href={`/dashboard/${story.id}`}
                  className="btn btn-sm btn-primary"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty">
          Your shelf is empty.{" "}
          <Link href="/dashboard/new">Create your first story.</Link>
        </p>
      )}
    </>
  );
}
