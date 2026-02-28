"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { saveWillStep } from "@/actions/will";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, AlertCircle } from "lucide-react";
import type { BeneficiaryData, DistributionType } from "@/types/will";
function newId() {
  return crypto.randomUUID();
}

interface FormValues {
  beneficiaries: BeneficiaryData[];
}

interface Props {
  documentId: string;
  defaultValues?: BeneficiaryData[];
}

export default function Step3Beneficiaries({ documentId, defaultValues }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      beneficiaries: defaultValues ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "beneficiaries" });
  const watchedBeneficiaries = watch("beneficiaries");

  // Calcular porcentaje total
  const totalPct = watchedBeneficiaries
    .filter((b) => b.distributionType === "PERCENTAGE")
    .reduce((sum, b) => sum + (Number(b.percentage) || 0), 0);

  function onSubmit(data: FormValues) {
    if (data.beneficiaries.length === 0) {
      toast.error("Por favor agrega al menos un beneficiario.");
      return;
    }

    const pctBeneficiaries = data.beneficiaries.filter((b) => b.distributionType === "PERCENTAGE");
    if (pctBeneficiaries.length > 0 && totalPct !== 100) {
      toast.error(`Los beneficiarios por porcentaje deben sumar 100%. Actualmente: ${totalPct}%`);
      return;
    }

    startTransition(async () => {
      const result = await saveWillStep(documentId, 3, { beneficiaries: data.beneficiaries });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.push("/will/4");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="font-serif text-lg font-bold text-brand-navy mb-1">Beneficiarios</h2>
        <p className="text-sm text-brand-slate">
          ¿Quién heredará tu patrimonio? Puedes dividir por porcentaje o asignar bienes específicos.
        </p>
      </div>

      {/* Advertencia de Porcentaje */}
      {watchedBeneficiaries.some((b) => b.distributionType === "PERCENTAGE") && totalPct !== 100 && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Total de porcentajes: <strong>{totalPct}%</strong> — debe ser exactamente 100%</span>
        </div>
      )}

      {/* Lista de Beneficiarios */}
      <div className="space-y-4">
        {fields.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-xl text-brand-slate text-sm">
            Sin beneficiarios aún. Haz clic en &ldquo;Agregar Beneficiario&rdquo; para comenzar.
          </div>
        )}

        {fields.map((field, index) => {
          const distType: DistributionType = watchedBeneficiaries[index]?.distributionType ?? "PERCENTAGE";
          return (
            <div key={field.id} className="bg-brand-cream border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-brand-navy text-sm">Beneficiario {index + 1}</span>
                <button type="button" onClick={() => remove(index)} className="text-destructive hover:opacity-70">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <input type="hidden" {...register(`beneficiaries.${index}.id`)} />

              <div className="space-y-3">
                {/* Fila de Nombre */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Nombre *</label>
                    <input
                      {...register(`beneficiaries.${index}.firstName`, { required: "Requerido" })}
                      className="form-input"
                      placeholder="Nombre"
                    />
                  </div>
                  <div>
                    <label className="form-label">Apellido *</label>
                    <input
                      {...register(`beneficiaries.${index}.lastName`, { required: "Requerido" })}
                      className="form-input"
                      placeholder="Apellido"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Relación *</label>
                    <input
                      {...register(`beneficiaries.${index}.relationship`, { required: "Requerido" })}
                      className="form-input"
                      placeholder="Cónyuge, Hijo/a, Hermano/a..."
                    />
                  </div>
                  <div>
                    <label className="form-label">Correo</label>
                    <input
                      type="email"
                      {...register(`beneficiaries.${index}.email`)}
                      className="form-input"
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                {/* Tipo de Distribución */}
                <div>
                  <label className="form-label">Tipo de Distribución *</label>
                  <div className="flex gap-3">
                    {(["PERCENTAGE", "SPECIFIC_GIFT"] as DistributionType[]).map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value={type}
                          {...register(`beneficiaries.${index}.distributionType`)}
                          className="accent-brand-navy"
                        />
                        <span className="text-sm">
                          {type === "PERCENTAGE" ? "Porcentaje del Patrimonio" : "Bien Específico"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Campos condicionales */}
                {distType === "PERCENTAGE" ? (
                  <div>
                    <label className="form-label">Porcentaje *</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        {...register(`beneficiaries.${index}.percentage`, {
                          valueAsNumber: true,
                          required: "El porcentaje es requerido",
                          min: { value: 1, message: "Mínimo 1%" },
                          max: { value: 100, message: "Máximo 100%" },
                        })}
                        className="form-input w-28"
                        placeholder="50"
                      />
                      <span className="text-brand-slate text-sm">% del patrimonio residual</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="form-label">Describe el Bien Específico *</label>
                    <textarea
                      {...register(`beneficiaries.${index}.specificGift`, { required: "Requerido" })}
                      className="form-input resize-none"
                      rows={2}
                      placeholder="Ej: Mi Toyota Camry 2019, VIN #...; o la casa familiar en Calle Principal 123..."
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() =>
          append({
            id: newId(),
            firstName: "",
            lastName: "",
            relationship: "",
            email: "",
            distributionType: "PERCENTAGE",
            percentage: undefined,
            specificGift: "",
          })
        }
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-3 text-sm text-brand-slate hover:border-brand-navy hover:text-brand-navy transition-colors"
      >
        <Plus className="w-4 h-4" /> Agregar Beneficiario
      </button>

      {/* Navegación */}
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={() => router.push("/will/2")} className="text-sm text-brand-slate hover:text-brand-navy">
          ← Atrás
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "Guardando..." : "Continuar a Tutela →"}
        </button>
      </div>
    </form>
  );
}
