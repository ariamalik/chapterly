import { redirect } from "next/navigation";

import AuthForm from "@/components/AuthForm";
import { currentWriter } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  const writer = await currentWriter();
  if (writer) redirect("/dashboard");

  return <AuthForm mode="signup" />;
}
