import Link from "next/link";

function hueFromSlug(slug) {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 360;
  }
  return hash;
}

export default function StoryCard({ story }) {
  const hue = hueFromSlug(story.slug);
  const chapterCount = Number(story.chapter_count);

  return (
    <Link href={`/stories/${story.slug}`} className="card">
      <span
        className="cover"
        style={{
          backgroundImage: `linear-gradient(150deg, hsl(${hue} 52% 46%), hsl(${
            (hue + 45) % 360
          } 48% 26%))`,
        }}
      >
        <span className="cover-title">{story.title}</span>
      </span>
      <span className="card-body">
        <strong className="card-title">{story.title}</strong>
        <span className="muted small">
          by {story.pen_name} · {chapterCount}{" "}
          {chapterCount === 1 ? "chapter" : "chapters"}
        </span>
        <span className="clamp">{story.synopsis}</span>
      </span>
    </Link>
  );
}
