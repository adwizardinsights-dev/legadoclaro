"use client";

import { useTransition, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAdminDocument, updateDocumentStatus, saveAdminNotes } from "@/actions/admin";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Loader2,
  User,
  Scale,
  Users,
  Baby,
  Building2,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { WILL_STATUS_LABELS, WILL_STATUS_COLORS, formatDate, formatCurrency } from "@/lib/utils";
import type { WillStatus } from "@prisma/client";
import type {
  PersonalInfoData,
  ExecutorInfoData,
  BeneficiaryData,
  GuardianshipData,
  AssetData,
} from "@/types/will";

type DocumentWithRelations = Awaited<ReturnType<typeof getAdminDocument>>;

const STATUS_OPTIONS: WillStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "NEEDS_REVISION",
  "COMPLETED",
];

export default function AdminDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [doc, setDoc] = useState<DocumentWithRelations>(null);
  const [notes, setNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<WillStatus>("DRAFT");

  useEffect(() => {
    getAdminDocument(id).then((d) => {
      setDoc(d);
      if (d) {
        setSelectedStatus(d.status);
        setNotes(d.adminNotes ?? "");
      }
    });
  }, [id]);

  function handleStatusUpdate() {
    startTransition(async () => {
      const result = await updateDocumentStatus(id, selectedStatus, notes || undefined);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`Estado actualizado a ${WILL_STATUS_LABELS[selectedStatus]}`);
      router.refresh();
    });
  }

  function handleSaveNotes() {
    startTransition(async () => {
      const result = await saveAdminNotes(id, notes);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Notas guardadas.");
    });
  }

  if (!doc) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-brand-slate" />
      </div>
    );
  }

  const personalInfo = doc.personalInfo as PersonalInfoData | null;
  const executorInfo = doc.executorInfo as ExecutorInfoData | null;
  const beneficiaries = doc.beneficiaries as BeneficiaryData[] | null;
  const guardianship = doc.guardianship as GuardianshipData | null;
  const assets = doc.assetsOverview as AssetData[] | null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin" className="flex items-center gap-1 text-sm text-brand-slate hover:text-brand-navy mb-2">
            <ArrowLeft className="w-4 h-4" /> Volver al Admin
          </Link>
          <h1 className="font-serif text-xl font-bold text-brand-navy">
            {doc.user.name ?? doc.user.email}
          </h1>
          <p className="text-sm text-brand-slate">{doc.user.email} · {doc.state ?? "Estado no definido"} · Actualizado {formatDate(doc.updatedAt)}</p>
        </div>
        <a
          href={`/api/will/pdf?documentId=${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border border-brand-navy text-brand-navy px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-cream transition-colors flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          Ver PDF
        </a>
      </div>

      {/* Control de Estado y Notas */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className={`status-badge ${WILL_STATUS_COLORS[doc.status]}`}>
            {WILL_STATUS_LABELS[doc.status]}
          </span>
          {doc.payments.length > 0 && (
            <span className="text-xs text-green-600 font-medium">
              Pagado {formatCurrency(doc.payments.reduce((s, p) => s + p.amount, 0))}
            </span>
          )}
          {doc.attorneyReviewRequest && (
            <span className="status-badge bg-purple-100 text-purple-700">Revisión de Abogado Solicitada</span>
          )}
        </div>

        <div>
          <label className="form-label">Actualizar Estado</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as WillStatus)}
            className="form-input max-w-xs"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{WILL_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            Notas Internas / Retroalimentación del Abogado
            <span className="text-xs text-brand-slate font-normal">(visible para el usuario si el estado es Aprobado o Requiere Cambios)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-input resize-none"
            rows={5}
            placeholder="Escribe tu retroalimentación legal o notas internas aquí..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleStatusUpdate}
            disabled={isPending}
            className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Actualizar Estado y Notas
          </button>
          <button
            onClick={handleSaveNotes}
            disabled={isPending}
            className="text-sm text-brand-slate border border-border px-4 py-2 rounded-lg hover:bg-brand-cream transition-colors"
          >
            Guardar Solo Notas
          </button>
        </div>
      </div>

      {/* Contenido del Documento */}
      {personalInfo && (
        <AdminSection title="Información Personal" icon={User}>
          <AdminGrid>
            <AdminField label="Nombre Completo" value={`${personalInfo.firstName} ${personalInfo.middleName ?? ""} ${personalInfo.lastName}`.trim()} />
            <AdminField label="Fecha de Nacimiento" value={personalInfo.dateOfBirth} />
            <AdminField label="Estado Civil" value={personalInfo.maritalStatus} />
            <AdminField label="Estado" value={personalInfo.state} />
            <AdminField label="Dirección" value={`${personalInfo.address}, ${personalInfo.city} ${personalInfo.zipCode}`} />
            <AdminField label="Cónyuge" value={personalInfo.spouseName} />
            <AdminField label="Hijos" value={personalInfo.children?.map((c) => `${c.name}${c.isMinor ? " (menor)" : ""}`).join(", ") || "Ninguno"} />
          </AdminGrid>
        </AdminSection>
      )}

      {executorInfo && (
        <AdminSection title="Albacea" icon={Scale}>
          <AdminGrid>
            <AdminField label="Albacea Principal" value={executorInfo.primaryExecutorName} />
            <AdminField label="Relación" value={executorInfo.primaryExecutorRelationship} />
            <AdminField label="Correo" value={executorInfo.primaryExecutorEmail} />
            <AdminField label="Suplente" value={executorInfo.alternateExecutorName} />
          </AdminGrid>
        </AdminSection>
      )}

      {beneficiaries && beneficiaries.length > 0 && (
        <AdminSection title={`Beneficiarios (${beneficiaries.length})`} icon={Users}>
          <div className="space-y-2">
            {beneficiaries.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                <span>{b.firstName} {b.lastName} ({b.relationship})</span>
                <span className="text-brand-slate">
                  {b.distributionType === "PERCENTAGE" ? `${b.percentage}%` : b.specificGift?.substring(0, 40)}
                </span>
              </div>
            ))}
          </div>
        </AdminSection>
      )}

      {guardianship?.guardianName && (
        <AdminSection title="Tutela" icon={Baby}>
          <AdminGrid>
            <AdminField label="Tutor Principal" value={guardianship.guardianName} />
            <AdminField label="Relación" value={guardianship.guardianRelationship} />
            <AdminField label="Suplente" value={guardianship.alternateGuardianName} />
          </AdminGrid>
        </AdminSection>
      )}

      {assets && assets.length > 0 && (
        <AdminSection title={`Bienes (${assets.length})`} icon={Building2}>
          <div className="space-y-2">
            {assets.map((a) => (
              <div key={a.id} className="text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                <div className="flex justify-between">
                  <span className="font-medium">{a.type.replace("_", " ")}: {a.description}</span>
                  {a.estimatedValue && <span className="text-brand-slate">${a.estimatedValue.toLocaleString()}</span>}
                </div>
                {a.beneficiaryName && <p className="text-brand-slate text-xs">→ {a.beneficiaryName}</p>}
              </div>
            ))}
          </div>
        </AdminSection>
      )}
    </div>
  );
}

function AdminSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 bg-brand-cream/80 px-5 py-3 border-b border-border">
        <Icon className="w-4 h-4 text-brand-navy" />
        <span className="font-semibold text-brand-navy text-sm">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function AdminGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">{children}</dl>;
}

function AdminField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-brand-slate text-xs mb-0.5">{label}</dt>
      <dd className="text-brand-navy font-medium">{value || "—"}</dd>
    </div>
  );
}
