"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { saveWillStep } from "@/actions/will";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { AssetData, AssetType } from "@/types/will";

function newId() {
  return crypto.randomUUID();
}

interface FormValues {
  assets: AssetData[];
}

interface Props {
  documentId: string;
  defaultValues?: AssetData[];
}

const ASSET_TYPES: { value: AssetType; label: string; description: string }[] = [
  { value: "REAL_ESTATE", label: "Inmueble", description: "Casa, terreno u otra propiedad" },
  { value: "BANK_ACCOUNT", label: "Cuenta Bancaria", description: "Cuenta corriente, ahorros, CDs" },
  { value: "INVESTMENT", label: "Inversiones", description: "Acciones, bonos, cuentas de retiro" },
  { value: "DIGITAL_ASSET", label: "Activos Digitales", description: "Cripto, cuentas en línea, NFTs" },
  { value: "VEHICLE", label: "Vehículo", description: "Automóvil, bote, motocicleta" },
  { value: "PERSONAL_PROPERTY", label: "Bienes Personales", description: "Joyas, arte, colecciones" },
  { value: "OTHER", label: "Otro", description: "Intereses empresariales, seguros de vida, etc." },
];

export default function Step5Assets({ documentId, defaultValues }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: { assets: defaultValues ?? [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "assets" });

  function onSubmit(data: FormValues) {
    startTransition(async () => {
      const result = await saveWillStep(documentId, 5, { assetsOverview: data.assets });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.push("/will/6");
    });
  }

  function handleSkip() {
    startTransition(async () => {
      const result = await saveWillStep(documentId, 5, { assetsOverview: [] });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.push("/will/6");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="font-serif text-lg font-bold text-brand-navy mb-1">Resumen de Bienes</h2>
        <p className="text-sm text-brand-slate">
          Enumera los bienes principales de tu patrimonio. Esto ayuda a estructurar tu testamento y brinda claridad a tu albacea.
          No es necesario listar cada artículo — enfócate en los bienes más significativos.
        </p>
      </div>

      {/* Lista de Bienes */}
      <div className="space-y-4">
        {fields.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-xl text-brand-slate text-sm">
            Sin bienes agregados aún. Haz clic en &ldquo;Agregar Bien&rdquo; u omite este paso.
          </div>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="bg-brand-cream border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-brand-navy text-sm">Bien {index + 1}</span>
              <button type="button" onClick={() => remove(index)} className="text-destructive hover:opacity-70">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <input type="hidden" {...register(`assets.${index}.id`)} />

            <div className="space-y-3">
              <div>
                <label className="form-label">Tipo de Bien *</label>
                <select {...register(`assets.${index}.type`)} className="form-input">
                  {ASSET_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label} — {t.description}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Descripción *</label>
                <input
                  {...register(`assets.${index}.description`, { required: "Requerido" })}
                  className="form-input"
                  placeholder="Ej: Residencia principal en Calle Principal 123, Nueva York, NY"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Valor Estimado (USD)</label>
                  <input
                    type="number"
                    min={0}
                    {...register(`assets.${index}.estimatedValue`, { valueAsNumber: true })}
                    className="form-input"
                    placeholder="250000"
                  />
                </div>
                <div>
                  <label className="form-label">Beneficiario Designado</label>
                  <input
                    {...register(`assets.${index}.beneficiaryName`)}
                    className="form-input"
                    placeholder="Nombre completo (opcional)"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Ubicación / Información de Cuenta</label>
                <input
                  {...register(`assets.${index}.location`)}
                  className="form-input"
                  placeholder="Nombre del banco, dirección, cuenta terminada en..."
                />
              </div>

              <div>
                <label className="form-label">Notas</label>
                <textarea
                  {...register(`assets.${index}.notes`)}
                  className="form-input resize-none"
                  rows={2}
                  placeholder="Notas adicionales para tu albacea..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          append({
            id: newId(),
            type: "REAL_ESTATE",
            description: "",
            estimatedValue: undefined,
            location: "",
            beneficiaryName: "",
            notes: "",
          })
        }
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-3 text-sm text-brand-slate hover:border-brand-navy hover:text-brand-navy transition-colors"
      >
        <Plus className="w-4 h-4" /> Agregar Bien
      </button>

      {/* Navegación */}
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={() => router.push("/will/4")} className="text-sm text-brand-slate hover:text-brand-navy">
          ← Atrás
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSkip}
            disabled={isPending}
            className="text-sm text-brand-slate hover:text-brand-navy px-4 py-2 border border-border rounded-lg"
          >
            Omitir
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Guardando..." : "Continuar a Revisión →"}
          </button>
        </div>
      </div>
    </form>
  );
}
