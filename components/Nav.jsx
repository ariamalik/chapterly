import Link from "next/link";

import ActionButton from "@/components/ActionButton";

export default function Nav({ writer }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            &#10022;
          </span>
          chapterly
        </Link>

        <nav className="nav-links">
          <Link href="/">Shelf</Link>
          {writer ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <span className="who">{writer.pen_name}</span>
              <ActionButton
                label="Sign out"
                url="/api/auth/signout"
                redirectTo="/"
                size="sm"
              />
            </>
          ) : (
            <>
              <Link href="/signin">Sign in</Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Start writing
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
