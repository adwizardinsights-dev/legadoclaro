"use client";

import { useState, useTransition } from "react";
import { checkoutConsultation } from "@/actions/payment";
import { toast } from "sonner";
import { Calendar, Clock, DollarSign, Loader2, Info } from "lucide-react";
import Link from "next/link";

// Horarios de consulta disponibles — en producción, reemplazar con API de calendario real (Calendly, Cal.com, etc.)
const AVAILABLE_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const AVAILABLE_TIMES = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

const TIMEZONES = [
  { value: "America/New_York", label: "Hora del Este (ET)" },
  { value: "America/Chicago", label: "Hora Central (CT)" },
  { value: "America/Denver", label: "Hora de la Montaña (MT)" },
  { value: "America/Los_Angeles", label: "Hora del Pacífico (PT)" },
];

export default function ConsultationPage() {
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");

  // Generar los próximos 14 días hábiles
  const availableDates: { date: Date; label: string }[] = [];
  const now = new Date();
  let dayCount = 0;
  let d = new Date(now);
  d.setDate(d.getDate() + 1); // Comenzar mañana

  while (availableDates.length < 14) {
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    if (AVAILABLE_DAYS.includes(dayName)) {
      availableDates.push({
        date: new Date(d),
        label: d.toLocaleDateString("es-US", { weekday: "short", month: "short", day: "numeric" }),
      });
    }
    d.setDate(d.getDate() + 1);
    dayCount++;
    if (dayCount > 60) break; // Seguridad
  }

  function handleBooking() {
    if (!selectedDate || !selectedTime) {
      toast.error("Por favor selecciona una fecha y hora para tu consulta.");
      return;
    }

    // Convertir la fecha y hora en un objeto Date
    const dateObj = availableDates.find((d) => d.date.toISOString().split("T")[0] === selectedDate)?.date;
    if (!dateObj) {
      toast.error("Fecha seleccionada inválida.");
      return;
    }

    const [time, meridiem] = selectedTime.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    const adjustedHours = meridiem === "PM" && hours !== 12 ? hours + 12 : hours === 12 && meridiem === "AM" ? 0 : hours;

    const scheduledAt = new Date(dateObj);
    scheduledAt.setHours(adjustedHours, minutes, 0, 0);

    startTransition(async () => {
      await checkoutConsultation(scheduledAt, timezone);
    });
  }

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard" className="text-sm text-brand-slate hover:text-brand-navy mb-6 inline-flex items-center gap-1">
        ← Panel
      </Link>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-6">
        <div>
          <h1 className="font-serif text-xl font-bold text-brand-navy mb-1">Reservar Consulta con Abogado</h1>
          <p className="text-brand-slate text-sm">
            Videollamada de 60 min 1:1 con un abogado licenciado en planificación patrimonial.
          </p>
        </div>

        {/* Info */}
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 bg-brand-cream rounded-xl p-3 text-sm">
            <Clock className="w-4 h-4 text-brand-navy" />
            <span>60 minutos</span>
          </div>
          <div className="flex items-center gap-2 bg-brand-cream rounded-xl p-3 text-sm">
            <DollarSign className="w-4 h-4 text-brand-navy" />
            <span>$199 único pago</span>
          </div>
          <div className="flex items-center gap-2 bg-brand-cream rounded-xl p-3 text-sm">
            <Calendar className="w-4 h-4 text-brand-navy" />
            <span>Videollamada</span>
          </div>
        </div>

        {/* Zona Horaria */}
        <div>
          <label className="form-label">Tu Zona Horaria</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="form-input max-w-xs"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>

        {/* Selección de Fecha */}
        <div>
          <label className="form-label">Selecciona una Fecha</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1">
            {availableDates.map(({ date, label }) => {
              const isoDate = date.toISOString().split("T")[0];
              return (
                <button
                  key={isoDate}
                  type="button"
                  onClick={() => setSelectedDate(isoDate)}
                  className={`py-2 px-3 rounded-xl text-sm border transition-colors ${
                    selectedDate === isoDate
                      ? "bg-brand-navy text-white border-brand-navy"
                      : "border-border hover:border-brand-navy hover:bg-brand-cream"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selección de Hora */}
        {selectedDate && (
          <div>
            <label className="form-label">Selecciona una Hora</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {AVAILABLE_TIMES.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 px-3 rounded-xl text-sm border transition-colors ${
                    selectedTime === time
                      ? "bg-brand-navy text-white border-brand-navy"
                      : "border-border hover:border-brand-navy hover:bg-brand-cream"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resumen */}
        {selectedDate && selectedTime && (
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Estás reservando una consulta para{" "}
              <strong>
                {availableDates.find((d) => d.date.toISOString().split("T")[0] === selectedDate)?.label} a las {selectedTime} ({TIMEZONES.find((tz) => tz.value === timezone)?.label})
              </strong>
              . Recibirás una invitación de calendario y enlace de videollamada después del pago.
            </p>
          </div>
        )}

        <button
          onClick={handleBooking}
          disabled={isPending || !selectedDate || !selectedTime}
          className="w-full flex items-center justify-center gap-2 bg-brand-navy text-white py-3 rounded-xl font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "Redirigiendo al Pago..." : "Reservar y Pagar $199"}
        </button>

        <p className="text-xs text-center text-brand-slate">
          Pago seguro a través de Stripe. Reembolso completo si se cancela con 24+ horas de anticipación.
        </p>
      </div>
    </div>
  );
}
