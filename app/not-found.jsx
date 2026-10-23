import Link from "next/link";

export default function NotFound() {
  return (
    <div className="panel">
      <h1>Not found</h1>
      <p className="muted">
        That page, story or chapter is not here — it may be unpublished, or the
        link may be wrong.
      </p>
      <Link href="/" className="btn btn-primary">
        Back to the shelf
      </Link>
    </div>
  );
}
