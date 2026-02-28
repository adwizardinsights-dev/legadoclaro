"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { saveWillStep } from "@/actions/will";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
import type { ExecutorInfoData } from "@/types/will";

interface Props {
  documentId: string;
  defaultValues?: ExecutorInfoData;
}

export default function Step2Executor({ documentId, defaultValues }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<ExecutorInfoData>({
    defaultValues: defaultValues ?? {
      primaryExecutorName: "",
      primaryExecutorRelationship: "",
      primaryExecutorEmail: "",
      primaryExecutorPhone: "",
      alternateExecutorName: "",
      alternateExecutorRelationship: "",
      alternateExecutorEmail: "",
    },
  });

  function onSubmit(data: ExecutorInfoData) {
    startTransition(async () => {
      const result = await saveWillStep(documentId, 2, { executorInfo: data });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.push("/will/3");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="font-serif text-lg font-bold text-brand-navy mb-1">Selección de Albacea</h2>
        <p className="text-sm text-brand-slate">Tu albacea ejecuta los términos de tu testamento. Elige a alguien de total confianza.</p>
      </div>

      {/* Cuadro Informativo */}
      <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>Un albacea (también llamado representante personal) es la persona responsable de administrar tu patrimonio después de tu fallecimiento: pagar deudas, declarar impuestos y distribuir bienes conforme a tu testamento.</p>
      </div>

      {/* Albacea Principal */}
      <div>
        <h3 className="font-semibold text-brand-navy mb-4 pb-2 border-b border-border">Albacea Principal</h3>
        <div className="space-y-4">
          <div>
            <label className="form-label">Nombre Legal Completo *</label>
            <input
              {...register("primaryExecutorName", { required: "El nombre del albacea es requerido" })}
              className="form-input"
              placeholder="Roberto Martínez"
            />
            {errors.primaryExecutorName && <p className="form-error">{errors.primaryExecutorName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Relación Contigo *</label>
              <input
                {...register("primaryExecutorRelationship", { required: "La relación es requerida" })}
                className="form-input"
                placeholder="Cónyuge, Hermano/a, Amigo/a..."
              />
              {errors.primaryExecutorRelationship && <p className="form-error">{errors.primaryExecutorRelationship.message}</p>}
            </div>
            <div>
              <label className="form-label">Correo Electrónico *</label>
              <input
                type="email"
                {...register("primaryExecutorEmail", { required: "El correo es requerido" })}
                className="form-input"
                placeholder="roberto@ejemplo.com"
              />
              {errors.primaryExecutorEmail && <p className="form-error">{errors.primaryExecutorEmail.message}</p>}
            </div>
          </div>

          <div>
            <label className="form-label">Número de Teléfono (Opcional)</label>
            <input
              type="tel"
              {...register("primaryExecutorPhone")}
              className="form-input"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>

      {/* Albacea Suplente */}
      <div>
        <h3 className="font-semibold text-brand-navy mb-4 pb-2 border-b border-border">
          Albacea Suplente <span className="font-normal text-brand-slate text-sm">(Recomendado)</span>
        </h3>
        <p className="text-sm text-brand-slate mb-4">
          Designa un suplente en caso de que tu albacea principal no pueda o no quiera ejercer el cargo.
        </p>

        <div className="space-y-4">
          <div>
            <label className="form-label">Nombre Legal Completo</label>
            <input
              {...register("alternateExecutorName")}
              className="form-input"
              placeholder="Sara López"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Relación Contigo</label>
              <input
                {...register("alternateExecutorRelationship")}
                className="form-input"
                placeholder="Hermano/a, Padre/Madre, Amigo/a..."
              />
            </div>
            <div>
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                {...register("alternateExecutorEmail")}
                className="form-input"
                placeholder="sara@ejemplo.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push("/will/1")}
          className="text-sm text-brand-slate hover:text-brand-navy"
        >
          ← Atrás
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "Guardando..." : "Continuar a Beneficiarios →"}
        </button>
      </div>
    </form>
  );
}
