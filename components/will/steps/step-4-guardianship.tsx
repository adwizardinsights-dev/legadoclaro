"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { saveWillStep } from "@/actions/will";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
import type { GuardianshipData } from "@/types/will";

interface Props {
  documentId: string;
  defaultValues?: GuardianshipData;
  hasMinors: boolean;
}

export default function Step4Guardianship({ documentId, defaultValues, hasMinors }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<GuardianshipData>({
    defaultValues: defaultValues ?? {
      guardianName: "",
      guardianRelationship: "",
      guardianEmail: "",
      alternateGuardianName: "",
      alternateGuardianRelationship: "",
    },
  });

  function onSubmit(data: GuardianshipData) {
    startTransition(async () => {
      const result = await saveWillStep(documentId, 4, { guardianship: data });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.push("/will/5");
    });
  }

  // Omitir paso si no hay menores
  function handleSkip() {
    startTransition(async () => {
      const result = await saveWillStep(documentId, 4, { guardianship: undefined });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.push("/will/5");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="font-serif text-lg font-bold text-brand-navy mb-1">Tutela</h2>
        <p className="text-sm text-brand-slate">
          Designa quién cuidará de tus hijos menores si falleces.
        </p>
      </div>

      {!hasMinors && (
        <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            No se registraron hijos menores en el Paso 1. Aún puedes designar un tutor aquí, u omitir este paso.
          </p>
        </div>
      )}

      {hasMinors && (
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Registraste hijos menores. <strong>Nombrar un tutor es altamente recomendado</strong> para protegerlos en caso de tu fallecimiento.
          </p>
        </div>
      )}

      {/* Tutor Principal */}
      <div>
        <h3 className="font-semibold text-brand-navy mb-4 pb-2 border-b border-border">
          Tutor Principal {hasMinors && <span className="text-destructive">*</span>}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="form-label">Nombre Legal Completo {hasMinors && "*"}</label>
            <input
              {...register("guardianName", hasMinors ? { required: "El nombre del tutor es requerido" } : {})}
              className="form-input"
              placeholder="Margarita Sánchez"
            />
            {errors.guardianName && <p className="form-error">{errors.guardianName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Relación Contigo {hasMinors && "*"}</label>
              <input
                {...register("guardianRelationship", hasMinors ? { required: "Requerido" } : {})}
                className="form-input"
                placeholder="Hermana, Amiga, Tía..."
              />
              {errors.guardianRelationship && <p className="form-error">{errors.guardianRelationship.message}</p>}
            </div>
            <div>
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                {...register("guardianEmail")}
                className="form-input"
                placeholder="margarita@ejemplo.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tutor Suplente */}
      <div>
        <h3 className="font-semibold text-brand-navy mb-4 pb-2 border-b border-border">
          Tutor Suplente <span className="text-brand-slate font-normal text-sm">(Recomendado)</span>
        </h3>
        <div className="space-y-4">
          <div>
            <label className="form-label">Nombre Legal Completo</label>
            <input
              {...register("alternateGuardianName")}
              className="form-input"
              placeholder="Tomás Herrera"
            />
          </div>
          <div>
            <label className="form-label">Relación Contigo</label>
            <input
              {...register("alternateGuardianRelationship")}
              className="form-input"
              placeholder="Hermano, Amigo de la Familia..."
            />
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={() => router.push("/will/3")} className="text-sm text-brand-slate hover:text-brand-navy">
          ← Atrás
        </button>
        <div className="flex gap-3">
          {!hasMinors && (
            <button
              type="button"
              onClick={handleSkip}
              disabled={isPending}
              className="text-sm text-brand-slate hover:text-brand-navy px-4 py-2 border border-border rounded-lg"
            >
              Omitir Paso
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Guardando..." : "Continuar a Bienes →"}
          </button>
        </div>
      </div>
    </form>
  );
}
