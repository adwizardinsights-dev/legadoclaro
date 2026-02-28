import Link from "next/link";

export const metadata = { title: "Términos de Servicio" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-white border-b border-border py-4 px-6">
        <Link href="/" className="font-serif text-2xl font-bold text-brand-navy">
          Legado<span className="text-brand-gold">Claro</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl font-bold text-brand-navy mb-2">Términos de Servicio</h1>
        <p className="text-brand-slate text-sm mb-8">Fecha de Vigencia: 1 de enero de 2025</p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-800">
          <strong>Aviso Legal Importante:</strong> LegadoClaro es un servicio de preparación de documentos y no
          proporciona asesoramiento legal. El uso de esta plataforma no crea una relación abogado-cliente. Los documentos
          generados son borradores que requieren una ejecución legal adecuada para ser válidos. La revisión de abogado debe
          contratarse específicamente para recibir asesoramiento legal.
        </div>

        <section className="space-y-6 text-brand-slate leading-relaxed">
          <div>
            <h2 className="font-serif text-xl font-bold text-brand-navy">1. Aceptación de los Términos</h2>
            <p>
              Al acceder o utilizar LegadoClaro, aceptas estar sujeto a estos Términos de Servicio. Si no
              estás de acuerdo, no utilices nuestros servicios.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-brand-navy">2. No Constituye Asesoramiento Legal</h2>
            <p>
              LegadoClaro únicamente proporciona servicios de preparación de documentos. La información y los documentos proporcionados
              son para fines informativos y no constituyen asesoramiento legal. Para asesoramiento legal específico a tu
              situación, consulta a un abogado licenciado en tu jurisdicción. La revisión de abogado (contratada por separado)
              constituye un compromiso independiente con un abogado de registro.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-brand-navy">3. Servicios y Precios</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Testamento Básico: $99 — preparación del documento y descarga en PDF</li>
              <li>Revisión de Abogado: $249 — revisión legal de tu documento de testamento</li>
              <li>Consulta: $199 — videoconsulta de 60 minutos</li>
              <li>Notarización: $79 — coordinación de notarización</li>
            </ul>
            <p className="mt-2">
              Todos los honorarios son no reembolsables una vez iniciado el servicio, excepto las consultas canceladas con 24+ horas
              de anticipación, que son elegibles para un reembolso completo.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-brand-navy">4. Validez del Documento</h2>
            <p>
              Los documentos de testamento generados por LegadoClaro son borradores. Solo adquieren validez legal mediante una
              ejecución adecuada conforme a las leyes de tu estado, lo que típicamente requiere firmar en presencia
              de dos testigos y, en muchos estados, un notario público. LegadoClaro no garantiza que los documentos
              cumplan todos los requisitos de validez legal en tu jurisdicción.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-brand-navy">5. Responsabilidades del Usuario</h2>
            <p>Eres responsable de:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Proporcionar información precisa y completa</li>
              <li>Ejecutar correctamente tu testamento conforme a las leyes de tu estado</li>
              <li>Mantener seguras las credenciales de tu cuenta</li>
              <li>Consultar a un abogado para necesidades complejas de planificación patrimonial</li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-brand-navy">6. Limitación de Responsabilidad</h2>
            <p>
              La responsabilidad de LegadoClaro se limita al importe pagado por el servicio específico que dio origen a la
              reclamación. No somos responsables de daños indirectos, incidentales o consecuentes. No garantizamos
              que los documentos sean legalmente válidos en tu jurisdicción sin una ejecución adecuada y revisión específica del estado.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-brand-navy">7. Ley Aplicable</h2>
            <p>
              Estos Términos se rigen por las leyes del Estado de Delaware, sin tener en cuenta los principios de conflicto de leyes.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-brand-navy">8. Contacto</h2>
            <p>
              ¿Preguntas?{" "}
              <a href="mailto:legal@legadoclaro.com" className="text-brand-navy underline">
                legal@legadoclaro.com
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
