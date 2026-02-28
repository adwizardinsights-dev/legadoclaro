import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutUser } from "@/actions/auth";
import { LayoutDashboard, FileText, LogOut, Shield, User } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      {/* Barra Superior */}
      <header className="bg-brand-navy text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="font-serif text-xl font-bold">
            Legado<span className="text-brand-gold">Claro</span>
          </Link>

          <div className="flex items-center gap-4">
            {session.user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-sm text-brand-gold hover:text-brand-gold-light transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Panel Admin</span>
              </Link>
            )}

            <div className="flex items-center gap-2 text-sm text-white/80">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{session.user.name ?? session.user.email}</span>
            </div>

            <form action={logoutUser}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Barra Lateral + Contenido */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Barra Lateral */}
        <aside className="hidden md:flex flex-col w-56 gap-1 shrink-0">
          <nav className="bg-white rounded-xl border border-border p-3 shadow-sm">
            <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Panel" />
            <SidebarLink href="/will/1" icon={FileText} label="Mi Testamento" />
          </nav>

          <div className="mt-4 bg-brand-navy/5 rounded-xl border border-border p-4 text-xs text-brand-slate">
            <p className="font-medium text-brand-navy mb-1">Aviso Legal</p>
            <p>Esta plataforma no reemplaza el asesoramiento legal independiente salvo que se contrate la revisión de abogado.</p>
          </div>
        </aside>

        {/* Principal */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-slate hover:bg-brand-cream hover:text-brand-navy transition-colors"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
