"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Small client button for one-shot mutations (publish, unpublish, delete, sign
 * out). `confirmText` turns the first click into an inline "are you sure" step.
 */
export default function ActionButton({
  label,
  method = "POST",
  url,
  body = null,
  confirmText = "",
  redirectTo = "",
  variant = "ghost",
  size = "",
}) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    if (confirmText && !armed) {
      setArmed(true);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        setBusy(false);
        setArmed(false);
        return;
      }
      setArmed(false);
      if (redirectTo) router.push(redirectTo);
      router.refresh();
      if (!redirectTo) setBusy(false);
    } catch {
      setError("Something went wrong.");
      setBusy(false);
      setArmed(false);
    }
  }

  return (
    <span className="action">
      <button
        type="button"
        className={`btn btn-${variant}${size ? ` btn-${size}` : ""}`}
        onClick={run}
        disabled={busy}
      >
        {busy ? "Working…" : armed ? confirmText : label}
      </button>
      {error ? <span className="form-error">{error}</span> : null}
    </span>
  );
}
