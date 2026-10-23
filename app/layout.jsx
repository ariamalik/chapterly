import "@/app/globals.css";

import Nav from "@/components/Nav";
import { currentWriter } from "@/lib/auth";

export const metadata = {
  title: "chapterly",
  description: "Serialized stories, published one chapter at a time.",
};

export default async function RootLayout({ children }) {
  const writer = await currentWriter();

  return (
    <html lang="en">
      <body>
        <Nav writer={writer} />
        <main className="container">{children}</main>
        <footer className="site-footer">
          chapterly — serialized stories, one chapter at a time.
        </footer>
      </body>
    </html>
  );
}
