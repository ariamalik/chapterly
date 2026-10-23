import Link from "next/link";

import StoryCard from "@/components/StoryCard";
import { listPublishedStories } from "@/lib/stories";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stories = await listPublishedStories();

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Serialized fiction</p>
        <h1>Stories that arrive a chapter at a time.</h1>
        <p className="lede">
          chapterly is where writers publish serials and readers follow along
          from the first line to the last.
        </p>
        <div className="hero-actions">
          <Link href="/signup" className="btn btn-primary">
            Start writing
          </Link>
          <a href="#shelf" className="btn">
            Browse the shelf
          </a>
        </div>
      </section>

      <section id="shelf">
        <div className="section-head">
          <h2>On the shelf</h2>
          <span className="muted small">
            {stories.length} {stories.length === 1 ? "story" : "stories"}
          </span>
        </div>

        {stories.length ? (
          <div className="grid">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <p className="empty">
            Nothing published yet.{" "}
            <Link href="/signup">Be the first to publish.</Link>
          </p>
        )}
      </section>
    </>
  );
}
