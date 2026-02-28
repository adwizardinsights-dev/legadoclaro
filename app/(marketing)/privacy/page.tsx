import Link from "next/link";

export const metadata = { title: "Política de Privacidad" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-white border-b border-border py-4 px-6">
        <Link href="/" className="font-serif text-2xl font-bold text-brand-navy">
          Legado<span className="text-brand-gold">Claro</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 prose prose-slate">
        <h1 className="font-serif text-3xl font-bold text-brand-navy mb-2">Política de Privacidad</h1>
        <p className="text-brand-slate text-sm mb-8">Fecha de Vigencia: 1 de enero de 2025</p>

        <section className="space-y-6 text-brand-slate leading-relaxed">
          <div>
            <h2 className="font-serif text-xl font-bold text-brand-navy">1. Información que Recopilamos</h2>
            <p>
              LegadoClaro recopila información personal que proporcionas directamente, incluyendo tu nombre, dirección de correo electrónico,
              fecha de nacimiento, domicilio e información de planificación patrimonial ingresada durante el proceso de creación del testamento.
              También recopilamos información de pago procesada de forma segura a través de Stripe, y datos de uso a través de registros
              estándar del servidor y análisis.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-brand-navy">2. Cómo Usamos tu Información</h2>
            <p>Utilizamos tu información para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Proporcionar y mejorar nuestros servicios de planificación patrimonial</li>
              <li>Generar tu documento de testamento</li>
              <li>Procesar pagos de forma segura a través de Stripe</li>
              <li>Comunicarnos contigo sobre tu cuenta y documentos</li>
              <li>Facilitar la revisión de abogado cuando sea adquirida</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-brand-navy">3. Seguridad de Datos</h2>
            <p>
              Implementamos medidas de seguridad estándar de la industria, incluyendo cifrado AES-256 en reposo,
              cifrado TLS/SSL en tránsito y controles de acceso que limitan quién puede ver tus datos.
              Los datos de tarjetas de pago nunca se almacenan en nuestros servidores — todo el procesamiento de pagos
              es manejado por Stripe, que tiene certificación PCI DSS Nivel 1.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-brand-navy">4. Compartición de Datos</h2>
            <p>
              No vendemos tu información personal. Solo compartimos datos con:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Abogados licenciados que hayan adquirido el servicio de revisión de abogado</li>
              <li>Procesadores de pago (Stripe) para el procesamiento de transacciones</li>
              <li>Proveedores de servicios de correo electrónico para comunicaciones transaccionales</li>
              <li>Autoridades cuando lo exija la ley aplicable</li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-brand-navy">5. Tus Derechos</h2>
            <p>
              Tienes derecho a acceder, corregir o eliminar tu información personal. Para ejercer estos
              derechos, contáctanos en privacy@legadoclaro.com. Responderemos dentro de 30 días.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-brand-navy">6. Retención de Datos</h2>
            <p>
              Conservamos tus datos mientras tu cuenta esté activa, más 7 años después del cierre de la cuenta
              para fines de cumplimiento legal. Los documentos de testamento pueden conservarse por más tiempo a tu solicitud.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-brand-navy">7. Contacto</h2>
            <p>
              ¿Preguntas sobre esta Política de Privacidad? Contáctanos en:{" "}
              <a href="mailto:privacy@legadoclaro.com" className="text-brand-navy underline">
                privacy@legadoclaro.com
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
