import type { Metadata } from "next";
import { AuthPage } from "@/components/app/auth-page";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an account to open your dashboard.",
};

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <AuthPage mode="signup" searchParams={searchParams} />;
}
