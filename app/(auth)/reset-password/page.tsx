"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { requestPasswordReset, resetPassword } from "@/actions/auth";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (token && email) {
    return <SetNewPasswordForm token={token} email={email} />;
  }

  return <RequestResetForm />;
}

// ──────────────────────────────────────────
// Paso 1 — Solicitar enlace de restablecimiento
// ──────────────────────────────────────────

function RequestResetForm() {
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await requestPasswordReset(formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-border p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="font-serif text-xl font-bold text-brand-navy mb-2">Revisa tu Correo</h2>
        <p className="text-brand-slate text-sm mb-6">
          Si existe una cuenta con ese correo, te hemos enviado un enlace para restablecer tu
          contraseña. Revisa tu bandeja de entrada (y la carpeta de spam).
        </p>
        <Link href="/login" className="text-brand-navy font-medium hover:underline text-sm">
          ← Volver a Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
        <h1 className="font-serif text-2xl font-bold text-brand-navy mb-2">Restablecer Contraseña</h1>
        <p className="text-brand-slate text-sm mb-6">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-navy mb-1.5">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition"
              placeholder="juan@ejemplo.com"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand-navy text-white py-3 rounded-lg font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Enviar Enlace
          </button>
        </form>
      </div>
      <p className="text-center text-sm text-brand-slate mt-6">
        <Link href="/login" className="text-brand-navy font-medium hover:underline">
          ← Volver a Iniciar Sesión
        </Link>
      </p>
    </div>
  );
}

// ──────────────────────────────────────────
// Paso 2 — Establecer nueva contraseña
// ──────────────────────────────────────────

function SetNewPasswordForm({ token, email }: { token: string; email: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    startTransition(async () => {
      const result = await resetPassword(token, email, newPassword);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("¡Contraseña restablecida! Por favor inicia sesión.");
      router.push("/login");
    });
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
        <h1 className="font-serif text-2xl font-bold text-brand-navy mb-2">Establecer Nueva Contraseña</h1>
        <p className="text-brand-slate text-sm mb-6">Elige una contraseña segura para tu cuenta.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-navy mb-1.5">
              Nueva Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition"
              placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-navy mb-1.5">
              Confirmar Nueva Contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition"
              placeholder="Repite tu contraseña"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand-navy text-white py-3 rounded-lg font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Restablecer Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
