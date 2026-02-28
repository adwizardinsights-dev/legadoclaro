import { getAdminStats, getAdminDocuments } from "@/actions/admin";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Users,
} from "lucide-react";
import { WILL_STATUS_LABELS, WILL_STATUS_COLORS, formatDate, formatCurrency } from "@/lib/utils";
import type { WillStatus } from "@prisma/client";

export const metadata = { title: "Panel Admin" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [stats, documents] = await Promise.all([
    getAdminStats(),
    getAdminDocuments(searchParams.status as WillStatus | undefined),
  ]);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-brand-navy">Panel de Administración</h1>
        <p className="text-brand-slate text-sm mt-1">Gestiona documentos de testamento y revisiones de abogados</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Documentos" value={stats.total} icon={FileText} />
        <StatCard label="En Revisión" value={stats.underReview} icon={Clock} color="text-yellow-600" />
        <StatCard label="Aprobados" value={stats.approved} icon={CheckCircle2} color="text-green-600" />
        <StatCard
          label="Ingresos Totales"
          value={formatCurrency(stats.totalRevenueCents)}
          icon={DollarSign}
          color="text-emerald-600"
        />
      </div>

      {/* Desglose por Estado */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "NEEDS_REVISION"] as WillStatus[]).map((status) => (
          <Link
            key={status}
            href={`/admin?status=${status}`}
            className={`text-center py-2 px-3 rounded-lg text-xs font-medium border transition-colors hover:opacity-80 ${WILL_STATUS_COLORS[status]} ${searchParams.status === status ? "ring-2 ring-brand-navy" : ""}`}
          >
            {WILL_STATUS_LABELS[status]}
            <span className="block font-bold text-base mt-0.5">
              {stats[status.toLowerCase() as keyof typeof stats] ?? 0}
            </span>
          </Link>
        ))}
      </div>
      {searchParams.status && (
        <Link href="/admin" className="text-xs text-brand-slate hover:text-brand-navy underline">
          ← Limpiar filtro
        </Link>
      )}

      {/* Tabla de Documentos */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-brand-navy">
            {searchParams.status
              ? `Documentos ${WILL_STATUS_LABELS[searchParams.status as WillStatus]}`
              : "Todos los Documentos"}
          </h2>
          <span className="text-xs text-brand-slate">{documents.length} documento{documents.length !== 1 ? "s" : ""}</span>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 text-brand-slate">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No se encontraron documentos.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/admin/documents/${doc.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-brand-cream transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-brand-navy text-sm truncate">
                      {doc.user.name ?? doc.user.email}
                    </p>
                    <span className={`status-badge ${WILL_STATUS_COLORS[doc.status]}`}>
                      {WILL_STATUS_LABELS[doc.status]}
                    </span>
                    {doc.attorneyReviewRequest && (
                      <span className="status-badge bg-purple-100 text-purple-700">Revisión Solicitada</span>
                    )}
                  </div>
                  <p className="text-xs text-brand-slate mt-0.5">
                    {doc.user.email} · Actualizado {formatDate(doc.updatedAt)}
                    {doc.state && ` · ${doc.state}`}
                  </p>
                </div>
                <div className="text-right text-xs text-brand-slate flex-shrink-0">
                  <p>Paso {doc.currentStep}/6</p>
                  {doc.payments.length > 0 && (
                    <p className="text-green-600 font-medium">
                      {formatCurrency(doc.payments.reduce((s, p) => s + p.amount, 0))}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = "text-brand-navy",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-brand-slate">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
