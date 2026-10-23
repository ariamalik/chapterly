"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function ChapterForm({ storyId, chapter = null }) {
  const router = useRouter();
  const formRef = useRef(null);
  const editing = Boolean(chapter);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      title: String(data.get("title") ?? ""),
      body: String(data.get("body") ?? ""),
    };

    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch(
        editing ? `/api/chapters/${chapter.id}` : `/api/stories/${storyId}/chapters`,
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.error || "Could not save the chapter.");
        setBusy(false);
        return;
      }
      if (editing) {
        setSaved(true);
      } else {
        formRef.current?.reset();
      }
      setBusy(false);
      router.refresh();
    } catch {
      setError("Could not save the chapter.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="form" ref={formRef}>
      <label className="field">
        <span>Chapter title</span>
        <input
          name="title"
          type="text"
          required
          minLength={2}
          defaultValue={chapter?.title ?? ""}
          placeholder="Chapter One: The Fog Line"
        />
      </label>

      <label className="field">
        <span>Chapter text</span>
        <textarea
          name="body"
          rows={editing ? 18 : 8}
          defaultValue={chapter?.body ?? ""}
          placeholder="Write the chapter…"
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}
      {saved ? <p className="form-ok">Saved.</p> : null}

      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Working…" : editing ? "Save chapter" : "Add chapter"}
      </button>
    </form>
  );
}
