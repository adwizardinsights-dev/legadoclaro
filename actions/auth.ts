"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { AuthError } from "next-auth";
import type { ActionResult } from "@/types/will";

// ──────────────────────────────────────────
// Schemas
// ──────────────────────────────────────────

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ──────────────────────────────────────────
// Actions
// ──────────────────────────────────────────

export async function registerUser(
  formData: FormData
): Promise<ActionResult<{ email: string }>> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  // Fire-and-forget — don't block registration on email failure
  sendWelcomeEmail(user.email!, user.name!).catch(console.error);

  return { success: true, data: { email } };
}

export async function loginUser(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Invalid email or password." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AuthError) {
      return { success: false, error: "Invalid email or password." };
    }
    throw err;
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/" });
}

export async function requestPasswordReset(
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email") as string;
  if (!email || !z.string().email().safeParse(email).success) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to avoid email enumeration
  if (!user) return { success: true, data: undefined };

  // In production: create a VerificationToken and email a reset link
  // For MVP: token-based reset via NextAuth email provider or custom flow
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  const { sendPasswordResetEmail } = await import("@/lib/email");
  sendPasswordResetEmail(email, resetUrl).catch(console.error);

  return { success: true, data: undefined };
}

export async function resetPassword(
  token: string,
  email: string,
  newPassword: string
): Promise<ActionResult> {
  const passwordResult = z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .safeParse(newPassword);

  if (!passwordResult.success) {
    return {
      success: false,
      error:
        "Password must be at least 8 characters with one uppercase letter and one number.",
    };
  }

  const record = await prisma.verificationToken.findFirst({
    where: { token, identifier: email },
  });

  if (!record || record.expires < new Date()) {
    return { success: false, error: "Reset link is invalid or has expired." };
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { password: hashed } }),
    prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    }),
  ]);

  return { success: true, data: undefined };
}
