"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function loginAction(_prev: { error?: string }, fd: FormData): Promise<{ error?: string }> {
  const callbackUrl = String(fd.get("callbackUrl") || "/admin");
  try {
    await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirectTo: callbackUrl.startsWith("/admin") ? callbackUrl : "/admin",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      const code = (error as AuthError & { code?: string }).code;
      return { error: code === "rate_limited" ? "Trop de tentatives. Réessayez dans 15 minutes." : "Identifiants invalides." };
    }
    throw error; // NEXT_REDIRECT on success
  }
}

export async function githubLoginAction() {
  await signIn("github", { redirectTo: "/admin" });
}
