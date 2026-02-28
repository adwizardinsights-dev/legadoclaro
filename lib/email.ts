import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "LegadoClaro <noreply@legadoclaro.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ──────────────────────────────────────────
// Plantillas de Correo (strings HTML — intercambiables por React Email si se desea)
// ──────────────────────────────────────────

function baseTemplate(body: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Georgia, serif; color: #1B2A4A; background: #FAF8F4; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .header { background: #1B2A4A; padding: 32px 40px; }
        .header h1 { color: #C9A84C; font-size: 24px; margin: 0; letter-spacing: 0.5px; }
        .body { padding: 40px; line-height: 1.7; font-size: 16px; }
        .btn { display: inline-block; background: #C9A84C; color: #1B2A4A; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; margin: 24px 0; }
        .footer { border-top: 1px solid #eee; padding: 24px 40px; font-size: 13px; color: #888; }
        .disclaimer { font-size: 12px; color: #aaa; margin-top: 16px; border-top: 1px solid #f0f0f0; padding-top: 12px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header"><h1>LegadoClaro</h1></div>
        <div class="body">${body}</div>
        <div class="footer">
          <p>LegadoClaro — Planificación Patrimonial Digital</p>
          <p class="disclaimer">Esta plataforma no reemplaza el asesoramiento legal independiente salvo que se contrate la revisión de abogado.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ──────────────────────────────────────────
// Remitentes
// ──────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Bienvenido a LegadoClaro — Tu Planificación Patrimonial Comienza Aquí",
    html: baseTemplate(`
      <p>Hola ${name || ""},</p>
      <p>Gracias por crear tu cuenta en LegadoClaro. Estás un paso más cerca de proteger tu legado y darle claridad a tus seres queridos.</p>
      <a href="${APP_URL}/dashboard" class="btn">Ir al Panel</a>
      <p>Si tienes alguna pregunta, simplemente responde a este correo.</p>
      <p>Con cariño,<br/>El Equipo de LegadoClaro</p>
    `),
  });
}

export async function sendDraftSavedEmail(email: string, name: string, step: number) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Tu Borrador de Testamento Ha Sido Guardado",
    html: baseTemplate(`
      <p>Hola ${name || ""},</p>
      <p>Tu borrador de testamento ha sido guardado en el <strong>Paso ${step}</strong>. Puedes retomarlo en cualquier momento desde tu panel.</p>
      <a href="${APP_URL}/dashboard" class="btn">Continuar mi Testamento</a>
      <p>Tu información está almacenada de forma segura y te estará esperando cuando regreses.</p>
    `),
  });
}

export async function sendPaymentConfirmationEmail(
  email: string,
  name: string,
  productName: string,
  amount: number
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Pago Confirmado — ${productName}`,
    html: baseTemplate(`
      <p>Hola ${name || ""},</p>
      <p>Tu pago de <strong>$${(amount / 100).toFixed(2)}</strong> por <strong>${productName}</strong> ha sido confirmado.</p>
      <a href="${APP_URL}/dashboard" class="btn">Ver Panel</a>
      <p>Gracias por confiar en LegadoClaro con tu planificación patrimonial.</p>
    `),
  });
}

export async function sendReviewRequestedEmail(email: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Revisión de Abogado Solicitada — Estamos en Ello",
    html: baseTemplate(`
      <p>Hola ${name || ""},</p>
      <p>Tu documento de testamento ha sido enviado para revisión de abogado. Nuestro equipo legal revisará tu documento y proporcionará retroalimentación dentro de 2–3 días hábiles.</p>
      <p>Recibirás un correo una vez que se complete la revisión.</p>
      <a href="${APP_URL}/dashboard" class="btn">Ver Estado del Documento</a>
    `),
  });
}

export async function sendReviewCompletedEmail(email: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Revisión de Abogado Completada — Acción Requerida",
    html: baseTemplate(`
      <p>Hola ${name || ""},</p>
      <p>Buenas noticias — un abogado ha completado la revisión de tu documento de testamento. Por favor inicia sesión en tu panel para ver la retroalimentación y los próximos pasos.</p>
      <a href="${APP_URL}/dashboard" class="btn">Ver Resultados de la Revisión</a>
    `),
  });
}

export async function sendConsultationConfirmedEmail(
  email: string,
  name: string,
  scheduledAt: Date,
  timezone: string
) {
  const dateStr = scheduledAt.toLocaleString("es-US", {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Consulta Confirmada — ¡Hasta Pronto!",
    html: baseTemplate(`
      <p>Hola ${name || ""},</p>
      <p>Tu consulta 1:1 con un abogado está confirmada para:</p>
      <p style="font-size: 18px; font-weight: bold; color: #C9A84C;">${dateStr}</p>
      <p>Recibirás una invitación de calendario y enlace de reunión en breve. Por favor llega preparado/a con cualquier pregunta sobre tu plan patrimonial.</p>
      <a href="${APP_URL}/dashboard" class="btn">Ver mi Panel</a>
    `),
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Restablece tu Contraseña de LegadoClaro",
    html: baseTemplate(`
      <p>Hola,</p>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de LegadoClaro asociada a esta dirección de correo.</p>
      <a href="${resetUrl}" class="btn">Restablecer Contraseña</a>
      <p>Este enlace expira en 1 hora. Si no solicitaste un restablecimiento de contraseña, puedes ignorar este correo con seguridad.</p>
    `),
  });
}
