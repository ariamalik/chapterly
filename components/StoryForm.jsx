"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StoryForm({ story = null }) {
  const router = useRouter();
  const editing = Boolean(story);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      title: String(data.get("title") ?? ""),
      synopsis: String(data.get("synopsis") ?? ""),
    };

    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch(
        editing ? `/api/stories/${story.id}` : "/api/stories",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.error || "Could not save the story.");
        setBusy(false);
        return;
      }
      if (editing) {
        setSaved(true);
        setBusy(false);
        router.refresh();
      } else {
        router.push(`/dashboard/${body.id}`);
      }
    } catch {
      setError("Could not save the story.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="form">
      <label className="field">
        <span>Title</span>
        <input
          name="title"
          type="text"
          required
          minLength={2}
          defaultValue={story?.title ?? ""}
          placeholder="The Lantern Keeper"
        />
      </label>

      <label className="field">
        <span>Synopsis</span>
        <textarea
          name="synopsis"
          rows={4}
          defaultValue={story?.synopsis ?? ""}
          placeholder="A few lines to pull readers in."
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}
      {saved ? <p className="form-ok">Saved.</p> : null}

      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy
          ? "Working…"
          : editing
            ? "Save story details"
            : "Create story"}
      </button>
    </form>
  );
}
