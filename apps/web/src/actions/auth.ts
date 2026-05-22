"use server";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { AuthError } from "@/types/auth";

export async function signInWithGithub() {
  await signIn("github", { redirectTo: "/dashboard/home" });
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard/home" });
}

export async function signInWithEmail(
  _prevState: AuthError | null,
  formData: FormData,
): Promise<AuthError | null> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      error: "MISSING_FIELDS",
      message: "Email and password are required.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  if (!user) {
    return {
      error: "USER_NOT_FOUND",
      message: "No account found with this email.",
    };
  }

  if (!user.password) {
    const providerLabel = [...new Set(user.accounts.map((a) => a.provider))]
      .map((p) =>
        p === "github" ? "GitHub" : p.charAt(0).toUpperCase() + p.slice(1),
      )
      .join(" or ");
    return {
      error: "NO_PASSWORD",
      message: `This account was created with ${providerLabel}. Please sign in using that option above.`,
    };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return {
      error: "INVALID_PASSWORD",
      message: "Incorrect password. Please try again.",
    };
  }

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard/home",
  });
  return null;
}

export async function signUpWithEmail(
  _prevState: AuthError | null,
  formData: FormData,
): Promise<AuthError | null> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm-password") as string;

  if (!name || !email || !password || !confirmPassword) {
    return { error: "MISSING_FIELDS", message: "All fields are required." };
  }

  if (password.length < 8) {
    return {
      error: "PASSWORD_TOO_SHORT",
      message: "Password must be at least 8 characters.",
    };
  }

  if (password !== confirmPassword) {
    return { error: "PASSWORD_MISMATCH", message: "Passwords do not match." };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  if (existing) {
    if (existing.accounts.length > 0) {
      const providerLabel = [
        ...new Set(existing.accounts.map((a) => a.provider)),
      ]
        .map((p) =>
          p === "github" ? "GitHub" : p.charAt(0).toUpperCase() + p.slice(1),
        )
        .join(" or ");
      return {
        error: "OAUTH_ACCOUNT_EXISTS",
        message: `This email is linked to a ${providerLabel} account. Please sign in using that option.`,
      };
    }
    return {
      error: "EMAIL_EXISTS",
      message: "An account with this email already exists. Please sign in.",
    };
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, password: hashed } });

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard/home",
  });
  return null;
}
