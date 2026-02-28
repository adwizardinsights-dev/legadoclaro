import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <header className="py-5 px-6 border-b border-border bg-white">
        <Link href="/" className="font-serif text-2xl font-bold text-brand-navy">
          Legado<span className="text-brand-gold">Claro</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-brand-slate border-t border-border">
        <p className="mb-1">
          <strong>Aviso Legal:</strong> Esta plataforma no reemplaza el asesoramiento legal independiente.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/privacy" className="hover:underline">Política de Privacidad</Link>
          <Link href="/terms" className="hover:underline">Términos de Servicio</Link>
        </div>
      </footer>
    </div>
  );
}
