"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitWillDocument } from "@/actions/will";
import { checkoutWillBasic } from "@/actions/payment";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  User,
  Users,
  Scale,
  Baby,
  Building2,
  Download,
  AlertTriangle,
} from "lucide-react";
import { WILL_STATUS_LABELS } from "@/lib/utils";
import type { WillWizardState } from "@/types/will";
import Link from "next/link";

interface Props {
  documentId: string;
  willState: WillWizardState;
}

export default function Step6Review({ documentId, willState }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { personalInfo, executorInfo, beneficiaries, guardianship, assetsOverview } = willState;

  const hasMinors = personalInfo?.children?.some((c) => c.isMinor) ?? false;
  const isComplete = !!personalInfo && !!executorInfo && (beneficiaries?.length ?? 0) > 0;

  function handleSubmitAndPay() {
    if (!confirmed) {
      toast.error("Por favor confirma que la información es correcta.");
      return;
    }
    startTransition(async () => {
      // Primero enviar el documento
      const submitResult = await submitWillDocument(documentId);
      if (!submitResult.success) {
        toast.error(submitResult.error);
        return;
      }
      // Luego redirigir a Stripe
      await checkoutWillBasic(documentId);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-lg font-bold text-brand-navy mb-1">Revisión Final</h2>
        <p className="text-sm text-brand-slate">
          Revisa la información de tu testamento. Puedes volver a cualquier paso para hacer cambios.
        </p>
      </div>

      {!isComplete && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Testamento Incompleto</p>
            <p>Por favor completa todos los pasos requeridos antes de finalizar tu testamento.</p>
          </div>
        </div>
      )}

      {/* Información Personal */}
      <ReviewSection title="Información Personal" icon={User} editHref="/will/1">
        {personalInfo ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewField label="Nombre Completo" value={`${personalInfo.firstName} ${personalInfo.middleName ?? ""} ${personalInfo.lastName}`.trim()} />
            <ReviewField label="Fecha de Nacimiento" value={personalInfo.dateOfBirth} />
            <ReviewField label="Estado Civil" value={personalInfo.maritalStatus} />
            <ReviewField label="Estado" value={personalInfo.state} />
            <ReviewField
              label="Dirección"
              value={`${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}`}
            />
            {personalInfo.spouseName && (
              <ReviewField label="Cónyuge" value={personalInfo.spouseName} />
            )}
            <ReviewField
              label="Hijos"
              value={
                personalInfo.children?.length
                  ? personalInfo.children.map((c) => c.name).join(", ")
                  : "Ninguno"
              }
            />
          </div>
        ) : (
          <MissingData href="/will/1" />
        )}
      </ReviewSection>

      {/* Albacea */}
      <ReviewSection title="Albacea" icon={Scale} editHref="/will/2">
        {executorInfo ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewField label="Albacea Principal" value={executorInfo.primaryExecutorName} />
            <ReviewField label="Relación" value={executorInfo.primaryExecutorRelationship} />
            <ReviewField label="Contacto" value={executorInfo.primaryExecutorEmail} />
            {executorInfo.alternateExecutorName && (
              <ReviewField label="Albacea Suplente" value={executorInfo.alternateExecutorName} />
            )}
          </div>
        ) : (
          <MissingData href="/will/2" />
        )}
      </ReviewSection>

      {/* Beneficiarios */}
      <ReviewSection title="Beneficiarios" icon={Users} editHref="/will/3">
        {beneficiaries && beneficiaries.length > 0 ? (
          <div className="space-y-2">
            {beneficiaries.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                <span className="text-brand-navy font-medium">
                  {b.firstName} {b.lastName} <span className="text-brand-slate font-normal">({b.relationship})</span>
                </span>
                <span className="text-brand-slate">
                  {b.distributionType === "PERCENTAGE"
                    ? `${b.percentage}% del patrimonio`
                    : b.specificGift?.substring(0, 40) + "..."}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <MissingData href="/will/3" />
        )}
      </ReviewSection>

      {/* Tutela */}
      {(hasMinors || guardianship?.guardianName) && (
        <ReviewSection title="Tutela" icon={Baby} editHref="/will/4">
          {guardianship?.guardianName ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <ReviewField label="Tutor Principal" value={guardianship.guardianName} />
              <ReviewField label="Relación" value={guardianship.guardianRelationship} />
              {guardianship.alternateGuardianName && (
                <ReviewField label="Tutor Suplente" value={guardianship.alternateGuardianName} />
              )}
            </div>
          ) : (
            <p className="text-sm text-orange-600">Sin tutor designado — recomendado para hijos menores.</p>
          )}
        </ReviewSection>
      )}

      {/* Bienes */}
      <ReviewSection title="Resumen de Bienes" icon={Building2} editHref="/will/5">
        {assetsOverview && assetsOverview.length > 0 ? (
          <div className="space-y-2">
            {assetsOverview.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                <div>
                  <span className="text-brand-navy font-medium">{a.type.replace("_", " ")}</span>
                  <span className="text-brand-slate ml-2">{a.description.substring(0, 50)}</span>
                </div>
                {a.estimatedValue && (
                  <span className="text-brand-slate">${a.estimatedValue.toLocaleString()}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-brand-slate italic">Sin bienes listados.</p>
        )}
      </ReviewSection>

      {/* Aviso Legal */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">Aviso Legal Importante</p>
        <p>
          Este documento es un <strong>borrador</strong>. No tiene validez legal hasta que sea debidamente ejecutado — firmado por ti
          ante dos testigos y, en algunos estados, un notario público. LegadoClaro recomienda encarecidamente
          la revisión de un abogado antes de la ejecución.
        </p>
      </div>

      {/* Casilla de Confirmación */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 accent-brand-navy w-4 h-4 flex-shrink-0"
        />
        <span className="text-sm text-brand-navy">
          Confirmo que la información proporcionada es correcta y completa según mi leal saber y entender. Entiendo
          que este documento es un borrador y requiere una ejecución adecuada para tener validez legal.
        </span>
      </label>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button type="button" onClick={() => router.push("/will/5")} className="text-sm text-brand-slate hover:text-brand-navy px-4 py-2 border border-border rounded-lg">
          ← Atrás
        </button>

        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Vista Previa del PDF (sin pago para borrador) */}
          <a
            href={`/api/will/pdf?documentId=${documentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 border border-brand-navy text-brand-navy px-4 py-3 rounded-lg text-sm font-medium hover:bg-brand-cream transition-colors"
          >
            <Download className="w-4 h-4" />
            Vista Previa del Borrador PDF
          </a>

          {/* Enviar y Pagar */}
          <button
            onClick={handleSubmitAndPay}
            disabled={isPending || !isComplete || !confirmed}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Enviar y Pagar $99</>
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-center text-brand-slate">
        Pago seguro a través de Stripe. Tus datos están cifrados. Consulta nuestra{" "}
        <Link href="/privacy" className="underline">Política de Privacidad</Link>.
      </p>
    </div>
  );
}

// ──────────────────────────────────────────
// Sub-componentes
// ──────────────────────────────────────────

function ReviewSection({
  title,
  icon: Icon,
  editHref,
  children,
}: {
  title: string;
  icon: React.ElementType;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-brand-cream/80 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-brand-navy" />
          <span className="font-semibold text-brand-navy text-sm">{title}</span>
        </div>
        <Link href={editHref} className="text-xs text-brand-slate hover:text-brand-navy hover:underline">
          Editar
        </Link>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-brand-slate text-xs">{label}</dt>
      <dd className="text-brand-navy font-medium">{value || "—"}</dd>
    </div>
  );
}

function MissingData({ href }: { href: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-orange-600">
      <AlertTriangle className="w-4 h-4" />
      <span>No completado. </span>
      <Link href={href} className="underline font-medium">
        Completar este paso
      </Link>
    </div>
  );
}
