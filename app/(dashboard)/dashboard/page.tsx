import { auth } from "@/lib/auth";
import { getDashboardData } from "@/actions/will";
import { checkoutAttorneyReview, checkoutWillBasic, checkoutNotarization } from "@/actions/payment";
import Link from "next/link";
import {
  FileText,
  Download,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Scale,
} from "lucide-react";
import {
  WILL_STATUS_LABELS,
  WILL_STATUS_COLORS,
  formatDate,
  formatCurrency,
  WIZARD_STEPS,
} from "@/lib/utils";
import type { WillDocument, Consultation, Payment } from "@prisma/client";

export const metadata = { title: "Panel" };

export default async function DashboardPage() {
  const session = await auth();
  const result = await getDashboardData();

  if (!result.success) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <p className="text-brand-slate">{result.error}</p>
      </div>
    );
  }

  const { willDocuments, consultations, payments } = result.data;
  const activeWill = willDocuments[0] ?? null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-brand-navy">
          Bienvenido, {session?.user?.name?.split(" ")[0] ?? ""}
        </h1>
        <p className="text-brand-slate text-sm mt-1">
          {activeWill
            ? "Tu plan patrimonial está en progreso."
            : "Crea tu testamento para proteger tu legado."}
        </p>
      </div>

      {/* Tarjeta del Testamento Activo */}
      {activeWill ? (
        <WillCard will={activeWill} payments={payments} />
      ) : (
        <EmptyWillCard />
      )}

      {/* Sección de Servicios */}
      <div className="grid sm:grid-cols-2 gap-4">
        <ConsultationCard />
        {activeWill && <AddOnCard documentId={activeWill.id} />}
      </div>

      {/* Consultas */}
      {consultations.length > 0 && (
        <ConsultationsSection consultations={consultations} />
      )}

      {/* Historial de Pagos */}
      {payments.length > 0 && (
        <PaymentHistory payments={payments} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// Tarjeta del Testamento
// ──────────────────────────────────────────

function WillCard({ will, payments }: { will: WillDocument; payments: Payment[] }) {
  const completedSteps = will.currentStep - 1;
  const totalSteps = WIZARD_STEPS.length;
  const progressPct = Math.round((completedSteps / totalSteps) * 100);
  const hasPaid = payments.some(
    (p) => p.willDocumentId === will.id && p.type === "WILL_BASIC"
  );

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-brand-navy" />
            <h2 className="font-semibold text-brand-navy">Último Testamento y Testamento</h2>
          </div>
          <p className="text-xs text-brand-slate">Última actualización: {formatDate(will.updatedAt)}</p>
        </div>
        <span className={`status-badge ${WILL_STATUS_COLORS[will.status]}`}>
          {WILL_STATUS_LABELS[will.status]}
        </span>
      </div>

      {/* Progreso */}
      {will.status === "DRAFT" && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-brand-slate mb-2">
            <span>Progreso</span>
            <span>{completedSteps}/{totalSteps} pasos completados</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-navy rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex gap-1 mt-3">
            {WIZARD_STEPS.map(({ step, label }) => (
              <div
                key={step}
                className={`flex-1 text-center text-xs py-1 px-1 rounded text-[10px] truncate ${
                  step < will.currentStep
                    ? "bg-brand-navy text-white"
                    : step === will.currentStep
                    ? "bg-brand-navy/20 text-brand-navy font-medium"
                    : "bg-muted text-brand-slate"
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notas de revisión */}
      {will.adminNotes && (will.status === "NEEDS_REVISION" || will.status === "APPROVED") && (
        <div className={`rounded-lg p-4 mb-4 text-sm ${will.status === "APPROVED" ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}>
          <div className="flex items-start gap-2">
            {will.status === "APPROVED" ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium text-brand-navy mb-1">Retroalimentación del Abogado</p>
              <p className="text-brand-slate">{will.adminNotes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-wrap gap-3">
        {will.status === "DRAFT" && (
          <Link
            href={`/will/${will.currentStep}`}
            className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-navy-light transition-colors"
          >
            {will.currentStep === 1 ? "Iniciar Testamento" : "Continuar Asistente"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}

        {(will.status === "SUBMITTED" || will.status === "APPROVED" || will.status === "COMPLETED") && (
          <a
            href={`/api/will/pdf?documentId=${will.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-navy-light transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </a>
        )}

        {will.status === "SUBMITTED" && !hasPaid && (
          <form action={checkoutAttorneyReview.bind(null, will.id)}>
            <button
              type="submit"
              className="flex items-center gap-2 border border-brand-navy text-brand-navy px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-cream transition-colors"
            >
              <Scale className="w-4 h-4" />
              Solicitar Revisión de Abogado — $249
            </button>
          </form>
        )}

        {will.status === "UNDER_REVIEW" && (
          <div className="flex items-center gap-2 text-sm text-brand-slate">
            <Clock className="w-4 h-4 text-yellow-500" />
            En revisión por abogado — 2–3 días hábiles
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// Tarjeta Testamento Vacío
// ──────────────────────────────────────────

function EmptyWillCard() {
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-border p-10 text-center">
      <FileText className="w-12 h-12 text-brand-slate/40 mx-auto mb-4" />
      <h2 className="font-serif text-xl font-bold text-brand-navy mb-2">
        Tu Testamento Está Esperando ser Escrito
      </h2>
      <p className="text-brand-slate text-sm mb-6 max-w-sm mx-auto">
        Protege a tu familia con un testamento legalmente estructurado. Nuestro asistente guiado lo hace simple.
      </p>
      <Link
        href="/will/1"
        className="inline-flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-navy-light transition-colors"
      >
        Iniciar mi Testamento
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ──────────────────────────────────────────
// Tarjeta de Consulta
// ──────────────────────────────────────────

function ConsultationCard() {
  return (
    <div className="bg-brand-navy text-white rounded-2xl p-6">
      <Calendar className="w-8 h-8 text-brand-gold mb-3" />
      <h3 className="font-serif text-lg font-bold mb-2">Reservar una Consulta</h3>
      <p className="text-white/70 text-sm mb-4">
        Llamada de 60 min 1:1 con un abogado especialista en herencias. $199 único pago.
      </p>
      <Link
        href="/dashboard/consultation"
        className="inline-flex items-center gap-2 bg-brand-gold text-brand-navy px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-gold-light transition-colors"
      >
        Reservar Ahora
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ──────────────────────────────────────────
// Tarjeta de Servicios Adicionales
// ──────────────────────────────────────────

function AddOnCard({ documentId }: { documentId: string }) {
  return (
    <div className="bg-brand-cream rounded-2xl border border-border p-6">
      <Scale className="w-8 h-8 text-brand-navy/50 mb-3" />
      <h3 className="font-serif text-lg font-bold text-brand-navy mb-2">Servicios Adicionales</h3>
      <p className="text-brand-slate text-sm mb-4">
        Asistencia de notarización para ejecutar legalmente tu testamento.
      </p>
      <form action={checkoutNotarization.bind(null, documentId)}>
        <button
          type="submit"
          className="inline-flex items-center gap-2 border border-brand-navy text-brand-navy px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors"
        >
          Agregar Notarización — $79
        </button>
      </form>
    </div>
  );
}

// ──────────────────────────────────────────
// Sección de Consultas
// ──────────────────────────────────────────

function ConsultationsSection({ consultations }: { consultations: Consultation[] }) {
  const STATUS_COLOR: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-700",
    COMPLETED: "bg-gray-100 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  const STATUS_LABELS: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmada",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
      <h3 className="font-semibold text-brand-navy mb-4">Consultas Programadas</h3>
      <div className="space-y-3">
        {consultations.map((c) => (
          <div key={c.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div>
              <p className="text-sm font-medium text-brand-navy">{formatDate(c.scheduledAt)}</p>
              <p className="text-xs text-brand-slate">60 min · {c.timezone}</p>
            </div>
            <span className={`status-badge ${STATUS_COLOR[c.status]}`}>{STATUS_LABELS[c.status] ?? c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// Historial de Pagos
// ──────────────────────────────────────────

function PaymentHistory({ payments }: { payments: Payment[] }) {
  const TYPE_LABELS: Record<string, string> = {
    WILL_BASIC: "Testamento Básico",
    ATTORNEY_REVIEW: "Revisión de Abogado",
    CONSULTATION: "Consulta",
    NOTARIZATION: "Notarización",
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
      <h3 className="font-semibold text-brand-navy mb-4">Historial de Pagos</h3>
      <div className="space-y-2">
        {payments.map((p) => (
          <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
            <div>
              <span className="font-medium text-brand-navy">{TYPE_LABELS[p.type]}</span>
              <span className="text-brand-slate ml-2 text-xs">{formatDate(p.createdAt)}</span>
            </div>
            <span className="text-brand-navy font-semibold">{formatCurrency(p.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
