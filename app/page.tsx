import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Clock, FileText, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <HowItWorks />
        <Features />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold text-brand-navy">
            Legado<span className="text-brand-gold">Claro</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-brand-slate">
          <Link href="#como-funciona" className="hover:text-brand-navy transition-colors">
            Cómo Funciona
          </Link>
          <Link href="#precios" className="hover:text-brand-navy transition-colors">
            Precios
          </Link>
          <Link href="#preguntas" className="hover:text-brand-navy transition-colors">
            Preguntas Frecuentes
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-brand-navy hover:underline hidden sm:block">
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="bg-brand-navy text-white text-sm px-4 py-2 rounded-md hover:bg-brand-navy-light transition-colors"
          >
            Crear mi Testamento
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero-gradient text-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-8">
          <Shield className="w-4 h-4 text-brand-gold" />
          <span>Seguro, Confidencial y Respaldado por Abogados</span>
        </div>

        <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight text-balance">
          Protege tu Legado.<br />
          <span className="text-brand-gold-light">Dale Claridad a tu Familia.</span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 text-balance">
          Crea un testamento legalmente estructurado en minutos — guiado paso a paso.
          Agrega revisión de abogado o agenda una consulta para mayor tranquilidad.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-navy font-semibold px-8 py-4 rounded-lg text-lg hover:bg-brand-gold-light transition-colors"
          >
            Crear mi Testamento — $99
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#precios"
            className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-4 rounded-lg text-lg hover:bg-white/10 transition-colors"
          >
            Agendar Consulta
          </Link>
        </div>

        <p className="mt-6 text-sm text-white/50">
          Sin suscripción. Pago único. Cancela antes de enviar.
        </p>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: Shield, label: "Cifrado de Nivel Bancario" },
    { icon: CheckCircle2, label: "Plantillas Revisadas por Abogados" },
    { icon: Clock, label: "Completa en Menos de 30 Minutos" },
    { icon: FileText, label: "Descarga PDF al Instante" },
  ];

  return (
    <section className="bg-brand-navy py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 justify-center">
              <Icon className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <span className="text-sm text-white/80">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Responde Preguntas Sencillas",
      description:
        "Nuestro asistente te guía por cada sección: información personal, albacea, beneficiarios, tutela y bienes.",
    },
    {
      number: "02",
      title: "Revisa y Confirma",
      description:
        "Revisa tu testamento completo. Realiza cambios cuando quieras antes de finalizar. Todo se guarda automáticamente.",
    },
    {
      number: "03",
      title: "Descarga y Firma",
      description:
        "Descarga el borrador en PDF. Fírmalo ante dos testigos (y notario si tu estado lo requiere) para que tenga validez legal.",
    },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy mb-4">
            Cómo Funciona LegadoClaro
          </h2>
          <p className="text-brand-slate max-w-xl mx-auto">
            La planificación patrimonial no tiene que ser complicada ni costosa.
            Nuestra plataforma te guía en cada etapa.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-xl p-8 shadow-sm border border-border card-hover">
              <div className="font-serif text-5xl font-bold text-brand-gold/30 mb-4">{step.number}</div>
              <h3 className="font-serif text-xl font-bold text-brand-navy mb-3">{step.title}</h3>
              <p className="text-brand-slate leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { title: "Asistente de Testamento Guiado", description: "Formulario de 6 pasos con datos personales, albacea, beneficiarios, tutela y bienes." },
    { title: "Guardado Automático y Reanudación", description: "Nunca pierdas tu progreso. Tu borrador siempre te espera donde lo dejaste." },
    { title: "Revisión de Abogado", description: "Un abogado licenciado revisa tu documento y da retroalimentación en 2–3 días hábiles." },
    { title: "Generación de PDF", description: "Descarga tu testamento en PDF con formato profesional, listo para firmar." },
    { title: "Consulta Individual", description: "Videollamada de 60 minutos con un abogado especialista en planificación patrimonial." },
    { title: "Notarización", description: "Conéctate con un notario para ejecutar tu testamento según los requisitos de tu estado." },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy mb-4">
            Todo lo que Necesitas
          </h2>
          <p className="text-brand-slate max-w-xl mx-auto">
            Desde el primer borrador hasta la firma legal — LegadoClaro cubre todo el proceso.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4 p-6 rounded-xl bg-brand-cream">
              <CheckCircle2 className="w-5 h-5 text-brand-gold mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-brand-navy mb-1">{f.title}</h3>
                <p className="text-sm text-brand-slate leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Testamento Básico",
      price: "$99",
      description: "Todo lo necesario para crear y descargar tu testamento.",
      features: ["Asistente guiado de 6 pasos", "Guardado automático", "Descarga en PDF", "Soporte por correo"],
      cta: "Comenzar Ahora",
      href: "/register",
      highlighted: false,
    },
    {
      name: "Testamento + Revisión Legal",
      price: "$249",
      description: "Tu testamento revisado y comentado por un abogado licenciado.",
      features: ["Todo lo del Testamento Básico", "Revisión en 2–3 días hábiles", "Retroalimentación escrita", "Asistencia para correcciones"],
      cta: "Obtener Revisión Legal",
      href: "/register?plan=revision",
      highlighted: true,
    },
    {
      name: "Consulta Individual",
      price: "$199",
      description: "Videollamada de 60 minutos con un abogado de herencias.",
      features: ["Videollamada de 60 minutos", "Asesoría personalizada", "Preguntas sobre tu situación", "Notas de la sesión incluidas"],
      cta: "Agendar Consulta",
      href: "/register?plan=consulta",
      highlighted: false,
    },
  ];

  return (
    <section id="precios" className="py-20 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy mb-4">
            Precios Simples y Transparentes
          </h2>
          <p className="text-brand-slate max-w-xl mx-auto">
            Sin suscripciones. Sin cargos sorpresa. Paga una vez por lo que necesitas.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border ${
                plan.highlighted
                  ? "bg-brand-navy border-brand-navy text-white shadow-xl scale-105"
                  : "bg-white border-border shadow-sm"
              }`}
            >
              {plan.highlighted && (
                <div className="text-xs font-bold text-brand-gold bg-brand-gold/20 rounded-full px-3 py-1 inline-block mb-4">
                  MÁS POPULAR
                </div>
              )}
              <h3 className={`font-serif text-xl font-bold mb-2 ${plan.highlighted ? "text-white" : "text-brand-navy"}`}>
                {plan.name}
              </h3>
              <div className="flex items-end gap-1 mb-3">
                <span className={`text-4xl font-bold ${plan.highlighted ? "text-brand-gold" : "text-brand-navy"}`}>
                  {plan.price}
                </span>
                <span className={`text-sm mb-1.5 ${plan.highlighted ? "text-white/60" : "text-brand-slate"}`}>
                  pago único
                </span>
              </div>
              <p className={`text-sm mb-6 ${plan.highlighted ? "text-white/70" : "text-brand-slate"}`}>
                {plan.description}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-gold" />
                    <span className={plan.highlighted ? "text-white/80" : "text-brand-slate"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-lg font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-brand-gold text-brand-navy hover:bg-brand-gold-light"
                    : "bg-brand-navy text-white hover:bg-brand-navy-light"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-brand-slate">
            Notarización disponible por $79 adicionales •{" "}
            <Link href="/terms" className="underline hover:text-brand-navy">Términos y Condiciones</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "¿Mi testamento tiene validez legal?",
      a: "LegadoClaro genera un testamento legalmente estructurado. Sin embargo, solo tiene validez legal una vez ejecutado correctamente: firmado ante dos testigos (y notario en algunos estados). Recomendamos firmemente la revisión de un abogado antes de firmarlo.",
    },
    {
      q: "¿LegadoClaro reemplaza a un abogado?",
      a: "No. LegadoClaro es una plataforma de preparación de documentos. No reemplaza el asesoramiento legal independiente a menos que adquieras la revisión de abogado. Para patrimonios complejos, recomendamos agendar una consulta.",
    },
    {
      q: "¿Está segura mi información personal?",
      a: "Sí. Todos los datos están cifrados en reposo y en tránsito. Nunca vendemos tu información. Consulta nuestra Política de Privacidad para más detalles.",
    },
    {
      q: "¿Puedo editar mi testamento después de guardarlo?",
      a: "Sí. Tu testamento permanece editable hasta que lo envíes para revisión o descargues el PDF final. Puedes reanudar desde tu panel en cualquier momento.",
    },
    {
      q: "¿Cuánto tarda la revisión del abogado?",
      a: "Típicamente 2–3 días hábiles. Recibirás un correo cuando la revisión esté lista, con retroalimentación escrita detallada.",
    },
    {
      q: "¿Qué estados son compatibles?",
      a: "LegadoClaro genera documentos para los 50 estados de EE.UU. y el Distrito de Columbia. La plataforma registra tu estado de residencia y aplica los requisitos estructurales correspondientes.",
    },
  ];

  return (
    <section id="preguntas" className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy mb-4">
            Preguntas Frecuentes
          </h2>
        </div>
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.q} className="border-b border-border pb-6">
              <h3 className="font-semibold text-brand-navy mb-2">{item.q}</h3>
              <p className="text-brand-slate text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="hero-gradient py-24 text-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-4 gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-5 h-5 fill-brand-gold text-brand-gold" />
          ))}
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
          Tu familia merece claridad.
        </h2>
        <p className="text-white/70 mb-10 text-lg">
          Crea tu testamento hoy. Toma menos de 30 minutos y le da a tus seres
          queridos la protección que merecen.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-brand-gold text-brand-navy font-bold px-10 py-4 rounded-xl text-lg hover:bg-brand-gold-light transition-colors"
        >
          Crear mi Testamento Ahora
          <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="text-white/40 text-sm mt-4">Sin compromiso hasta el pago. 100% privado.</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-brand-navy text-white/60 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <span className="font-serif text-xl font-bold text-white block mb-3">
              Legado<span className="text-brand-gold">Claro</span>
            </span>
            <p className="text-sm leading-relaxed">
              Planificación patrimonial digital, accesible, segura y profesional.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Plataforma</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register" className="hover:text-white transition-colors">Crear mi Testamento</Link></li>
              <li><Link href="#precios" className="hover:text-white transition-colors">Precios</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Términos de Servicio</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} LegadoClaro. Todos los derechos reservados.</p>
          <p className="max-w-md text-right">
            <strong className="text-white/80">Aviso Legal:</strong> LegadoClaro es un servicio de preparación de documentos y no proporciona asesoramiento legal. El uso de esta plataforma no crea una relación abogado-cliente.
          </p>
        </div>
      </div>
    </footer>
  );
}
