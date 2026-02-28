"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { saveWillStep } from "@/actions/will";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { US_STATES } from "@/lib/utils";
import type { PersonalInfoData, MaritalStatus } from "@/types/will";

interface Props {
  documentId: string;
  defaultValues?: PersonalInfoData;
  defaultState?: string;
}

export default function Step1Personal({ documentId, defaultValues, defaultState }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<PersonalInfoData>({
    defaultValues: defaultValues ?? {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      address: "",
      city: "",
      state: defaultState ?? "",
      zipCode: "",
      maritalStatus: "SINGLE",
      spouseName: "",
      children: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "children" });
  const maritalStatus = watch("maritalStatus");

  function onSubmit(data: PersonalInfoData) {
    startTransition(async () => {
      const result = await saveWillStep(documentId, 1, {
        personalInfo: data,
        state: data.state,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.push("/will/2");
    });
  }

  const MARITAL_OPTIONS: { value: MaritalStatus; label: string }[] = [
    { value: "SINGLE", label: "Soltero/a" },
    { value: "MARRIED", label: "Casado/a" },
    { value: "DIVORCED", label: "Divorciado/a" },
    { value: "WIDOWED", label: "Viudo/a" },
    { value: "DOMESTIC_PARTNERSHIP", label: "Unión de Hecho" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="font-serif text-lg font-bold text-brand-navy mb-1">Información Personal</h2>
        <p className="text-sm text-brand-slate">Ingresa tu nombre legal completo tal como aparece en tu documento de identificación oficial.</p>
      </div>

      {/* Fila de Nombre */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="form-label">Nombre *</label>
          <input {...register("firstName", { required: "Requerido" })} className="form-input" placeholder="Juan" />
          {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="form-label">Segundo Nombre</label>
          <input {...register("middleName")} className="form-input" placeholder="Carlos" />
        </div>
        <div>
          <label className="form-label">Apellido *</label>
          <input {...register("lastName", { required: "Requerido" })} className="form-input" placeholder="García" />
          {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
        </div>
      </div>

      {/* Fecha de Nacimiento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Fecha de Nacimiento *</label>
          <input type="date" {...register("dateOfBirth", { required: "Requerido" })} className="form-input" />
          {errors.dateOfBirth && <p className="form-error">{errors.dateOfBirth.message}</p>}
        </div>
        <div>
          <label className="form-label">Estado de Residencia *</label>
          <select {...register("state", { required: "Requerido" })} className="form-input">
            <option value="">Selecciona estado...</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {errors.state && <p className="form-error">{errors.state.message}</p>}
        </div>
      </div>

      {/* Dirección */}
      <div className="space-y-4">
        <div>
          <label className="form-label">Dirección *</label>
          <input {...register("address", { required: "Requerido" })} className="form-input" placeholder="123 Calle Principal, Apt 4B" />
          {errors.address && <p className="form-error">{errors.address.message}</p>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="form-label">Ciudad *</label>
            <input {...register("city", { required: "Requerido" })} className="form-input" placeholder="Nueva York" />
            {errors.city && <p className="form-error">{errors.city.message}</p>}
          </div>
          <div>
            <label className="form-label">Código Postal *</label>
            <input {...register("zipCode", { required: "Requerido", pattern: { value: /^\d{5}(-\d{4})?$/, message: "Código postal inválido" } })} className="form-input" placeholder="10001" />
            {errors.zipCode && <p className="form-error">{errors.zipCode.message}</p>}
          </div>
        </div>
      </div>

      {/* Estado Civil */}
      <div>
        <label className="form-label">Estado Civil *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
          {MARITAL_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 cursor-pointer hover:bg-brand-cream transition-colors">
              <input type="radio" value={opt.value} {...register("maritalStatus")} className="accent-brand-navy" />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cónyuge — condicional */}
      {(maritalStatus === "MARRIED" || maritalStatus === "DOMESTIC_PARTNERSHIP") && (
        <div>
          <label className="form-label">Nombre Legal Completo del Cónyuge / Pareja *</label>
          <input
            {...register("spouseName", { required: "Requerido cuando está casado/a o en unión de hecho" })}
            className="form-input"
            placeholder="María García"
          />
          {errors.spouseName && <p className="form-error">{errors.spouseName.message}</p>}
        </div>
      )}

      {/* Hijos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="form-label mb-0">Hijos</label>
          <button
            type="button"
            onClick={() => append({ name: "", dateOfBirth: "", isMinor: false })}
            className="flex items-center gap-1 text-xs text-brand-navy hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Hijo
          </button>
        </div>

        {fields.length === 0 && (
          <p className="text-sm text-brand-slate border border-dashed border-border rounded-lg p-4 text-center">
            Sin hijos agregados. Haz clic en &ldquo;Agregar Hijo&rdquo; para incluirlos.
          </p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-brand-cream rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-brand-navy">Hijo {index + 1}</span>
                <button type="button" onClick={() => remove(index)} className="text-destructive hover:opacity-70">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Nombre Completo *</label>
                  <input {...register(`children.${index}.name`, { required: "Requerido" })} className="form-input" placeholder="Emily García" />
                </div>
                <div>
                  <label className="form-label">Fecha de Nacimiento</label>
                  <input type="date" {...register(`children.${index}.dateOfBirth`)} className="form-input" />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input type="checkbox" {...register(`children.${index}.isMinor`)} className="accent-brand-navy" />
                <span className="text-sm text-brand-slate">Este hijo es actualmente menor de edad (menor de 18 años)</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Enviar */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "Guardando..." : "Continuar al Albacea →"}
        </button>
      </div>
    </form>
  );
}
