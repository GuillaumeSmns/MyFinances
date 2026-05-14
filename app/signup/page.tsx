import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign up | MyFinances",
  description: "Create a MyFinances account.",
};

export default function SignupPage() {
  return <SignupForm />;
}
