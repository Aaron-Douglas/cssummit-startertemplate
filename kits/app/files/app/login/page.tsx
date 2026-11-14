import type { Metadata } from "next";
import { AuthPage } from "@/components/app/auth-page";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your account.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <AuthPage mode="login" searchParams={searchParams} />;
}
