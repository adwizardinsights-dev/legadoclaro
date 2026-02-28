"use client";

import Link from "next/link";
import { WIZARD_STEPS } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface WizardLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  documentId: string;
}

export default function WizardLayout({
  children,
  currentStep,
  totalSteps,
}: WizardLayoutProps) {
  const progress = Math.round(((currentStep - 1) / totalSteps) * 100);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Volver al panel */}
      <Link
        href="/dashboard"
        className="text-sm text-brand-slate hover:text-brand-navy mb-6 inline-flex items-center gap-1"
      >
        ← Panel
      </Link>

      {/* Encabezado de Progreso */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-serif text-xl font-bold text-brand-navy">
              {WIZARD_STEPS[currentStep - 1]?.label}
            </h1>
            <p className="text-xs text-brand-slate mt-0.5">
              Paso {currentStep} de {totalSteps}
            </p>
          </div>
          <span className="text-sm font-semibold text-brand-navy">{progress}%</span>
        </div>

        {/* Barra */}
        <div className="h-1.5 bg-muted rounded-full mb-5">
          <div
            className="h-full bg-brand-navy rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Puntos de Pasos */}
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map(({ step, label }) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            return (
              <div key={step} className="flex flex-col items-center gap-1">
                {isCompleted ? (
                  <Link href={`/will/${step}`}>
                    <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </Link>
                ) : (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? "bg-brand-gold text-brand-navy"
                        : "bg-muted text-brand-slate"
                    }`}
                  >
                    {step}
                  </div>
                )}
                <span className={`text-[10px] hidden sm:block ${isCurrent ? "text-brand-navy font-medium" : "text-brand-slate"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contenido del Paso */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8">
        {children}
      </div>

      {/* Aviso Legal */}
      <p className="text-center text-xs text-brand-slate/60 mt-4">
        Tu progreso se guarda automáticamente. Esta plataforma no reemplaza el asesoramiento legal independiente.
      </p>
    </div>
  );
}
