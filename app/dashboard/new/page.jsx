import Link from "next/link";
import { redirect } from "next/navigation";

import StoryForm from "@/components/StoryForm";
import { currentWriter } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  const writer = await currentWriter();
  if (!writer) redirect("/signin?notice=Sign in to start a story.");

  return (
    <>
      <p className="eyebrow">
        <Link href="/dashboard">Writing desk</Link>
      </p>
      <div className="panel">
        <h1>New story</h1>
        <p className="muted">
          Give your serial a title and a hook. You can add chapters next, and
          publish when you are ready.
        </p>
        <StoryForm />
      </div>
    </>
  );
}
