import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { WillStatus } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export const WILL_STATUS_LABELS: Record<WillStatus, string> = {
  DRAFT: "Borrador",
  SUBMITTED: "Enviado",
  UNDER_REVIEW: "En Revisión Legal",
  APPROVED: "Aprobado",
  NEEDS_REVISION: "Requiere Cambios",
  COMPLETED: "Completado",
};

export const WILL_STATUS_COLORS: Record<WillStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-700",
  NEEDS_REVISION: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

export const WIZARD_STEPS = [
  { step: 1, label: "Datos Personales" },
  { step: 2, label: "Albacea" },
  { step: 3, label: "Beneficiarios" },
  { step: 4, label: "Tutela" },
  { step: 5, label: "Bienes" },
  { step: 6, label: "Revisión" },
] as const;

export const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawái" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Luisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Misisipi" },
  { value: "MO", label: "Misuri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "Nuevo Hampshire" },
  { value: "NJ", label: "Nueva Jersey" },
  { value: "NM", label: "Nuevo México" },
  { value: "NY", label: "Nueva York" },
  { value: "NC", label: "Carolina del Norte" },
  { value: "ND", label: "Dakota del Norte" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregón" },
  { value: "PA", label: "Pensilvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "Carolina del Sur" },
  { value: "SD", label: "Dakota del Sur" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "Virginia Occidental" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "Distrito de Columbia" },
] as const;
