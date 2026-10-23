import { redirect } from "next/navigation";

import AuthForm from "@/components/AuthForm";
import { currentWriter } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }) {
  const writer = await currentWriter();
  if (writer) redirect("/dashboard");

  const { notice } = await searchParams;

  return (
    <AuthForm
      mode="signin"
      notice={typeof notice === "string" ? notice : ""}
    />
  );
}
