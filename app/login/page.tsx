import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in | MyFinances",
  description: "Sign in to your MyFinances workspace.",
};

export default function LoginPage() {
  return <LoginForm />;
}
