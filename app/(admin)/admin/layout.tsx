import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutUser } from "@/actions/auth";
import { Shield, LayoutDashboard, FileText, LogOut } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <header className="bg-brand-navy text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-xl font-bold">
              Legado<span className="text-brand-gold">Claro</span>
            </Link>
            <div className="flex items-center gap-1.5 bg-brand-gold/20 text-brand-gold px-2.5 py-1 rounded-full text-xs font-medium">
              <Shield className="w-3.5 h-3.5" />
              Admin
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Mi Panel</span>
            </Link>
            <form action={logoutUser}>
              <button type="submit" className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
        <aside className="hidden md:flex flex-col w-56 gap-1 shrink-0">
          <nav className="bg-white rounded-xl border border-border p-3 shadow-sm">
            <AdminNavLink href="/admin" icon={LayoutDashboard} label="Resumen" />
            <AdminNavLink href="/admin?status=SUBMITTED" icon={FileText} label="Enviados" />
            <AdminNavLink href="/admin?status=UNDER_REVIEW" icon={FileText} label="En Revisión" />
            <AdminNavLink href="/admin?status=APPROVED" icon={FileText} label="Aprobados" />
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

function AdminNavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-slate hover:bg-brand-cream hover:text-brand-navy transition-colors">
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
