"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function AuthForm({ mode, notice = "" }) {
  const router = useRouter();
  const signingUp = mode === "signup";
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    };
    if (signingUp) payload.pen_name = String(data.get("pen_name") ?? "");

    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        signingUp ? "/api/auth/signup" : "/api/auth/signin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.error || "Something went wrong.");
        setBusy(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <h1>{signingUp ? "Create your writer account" : "Welcome back"}</h1>
      <p className="muted">
        {signingUp
          ? "Publish serials one chapter at a time."
          : "Sign in to keep writing."}
      </p>

      {notice ? <p className="form-error">{notice}</p> : null}

      <form onSubmit={onSubmit} className="form">
        {signingUp ? (
          <label className="field">
            <span>Pen name</span>
            <input
              name="pen_name"
              type="text"
              required
              minLength={2}
              autoComplete="nickname"
              placeholder="Aria Malik"
            />
          </label>
        ) : null}

        <label className="field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={signingUp ? "new-password" : "current-password"}
            placeholder="At least 8 characters"
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Working…" : signingUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="muted small">
        {signingUp ? (
          <>
            Already writing? <Link href="/signin">Sign in</Link>
          </>
        ) : (
          <>
            New here? <Link href="/signup">Create an account</Link>
          </>
        )}
      </p>
    </div>
  );
}
