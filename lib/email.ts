import { Resend } from "resend"
import nodemailer from "nodemailer"

function getSmtpTransporter() {
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER)?.trim()
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD
  const pass = rawPass ? rawPass.replace(/\s+/g, "").trim() : null

  if (!user || !pass) {
    return null
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  })

  return { transporter, user }
}

function getSenderEmail(): string {
  const envFrom = process.env.RESEND_FROM_EMAIL
  if (!envFrom) {
    return "ABC Synthese <onboarding@resend.dev>"
  }
  // Resend does not allow sending from unverified .vercel.app domains
  if (envFrom.includes(".vercel.app")) {
    console.warn(
      `[Resend Email] Warning: RESEND_FROM_EMAIL="${envFrom}" uses a .vercel.app domain which is not supported by Resend. Falling back to "ABC Synthese <onboarding@resend.dev>".`
    )
    return "ABC Synthese <onboarding@resend.dev>"
  }
  return envFrom
}

export type SendPasswordResetEmailParams = {
  to: string
  userName?: string
  code: string
  ttlMinutes?: number
}

export type SendNotificationEmailParams = {
  to: string
  userName?: string
  subject: string
  title: string
  message: string
  details?: Array<{ label: string; value: string }>
  actionUrl?: string
  actionText?: string
}

export type EmailResult = {
  success: boolean
  id?: string
  error?: string
}

/**
 * Dispatch email via Gmail SMTP (if configured) or Resend (as fallback).
 */
async function sendEmailCore({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<EmailResult> {
  const smtp = getSmtpTransporter()

  if (smtp) {
    try {
      const fromName = process.env.SMTP_FROM_NAME || "ABC Synthèse"
      const info = await smtp.transporter.sendMail({
        from: `"${fromName}" <${smtp.user}>`,
        to,
        subject,
        html,
        text,
      })
      console.log(`[Gmail SMTP] Email successfully sent to ${to} (MessageId: ${info.messageId})`)
      return { success: true, id: info.messageId }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error("[Gmail SMTP] Error sending email via Gmail:", errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY
  const resend = resendApiKey ? new Resend(resendApiKey) : null
  const defaultFrom = getSenderEmail()

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: defaultFrom,
        to: [to],
        subject,
        html,
        text,
      })

      if (error) {
        console.error("[Resend Email] Error sending email:", error)
        return { success: false, error: error.message }
      }

      console.log(`[Resend Email] Email sent to ${to} (ID: ${data?.id})`)
      return { success: true, id: data?.id }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error("[Resend Email] Exception sending email:", errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  console.info(
    `\n[Simulated Email] No Gmail SMTP or Resend API key set. Simulated delivery to ${to}:\nSubject: ${subject}\n`
  )
  return { success: true, id: "simulated-dev-id" }
}

/**
 * Renders a clean, modern HTML email template for password reset codes.
 */
function renderPasswordResetHtml(userName: string, code: string, ttlMinutes: number = 15): string {
  const greetingName = userName.trim() ? userName.trim() : "Bonjour"

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de votre mot de passe - ABC Synthèse</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f9; color: #1e293b;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 32px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.1); padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.15);">
                <span style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 1px;">ABC SYNTHÈSE</span>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px 32px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a; text-align: center;">
                Réinitialisation de votre mot de passe
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;">
                Bonjour ${greetingName},<br>
                Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de vérification à 6 chiffres :
              </p>

              <!-- Verification Code Box -->
              <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px 16px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #2563eb; display: inline-block; padding-left: 10px;">
                  ${code}
                </span>
              </div>

              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.5;">
                  ⏱️ Ce code expire dans <strong>${ttlMinutes} minutes</strong>. Ne communiquez ce code à personne.
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b; text-align: center;">
                Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} ABC Synthèse. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Renders a clean HTML template for operational notifications.
 */
function renderNotificationHtml(
  userName: string,
  title: string,
  message: string,
  details?: Array<{ label: string; value: string }>,
  actionUrl?: string,
  actionText?: string
): string {
  const greetingName = userName.trim() ? userName.trim() : "Bonjour"
  const baseUrl = process.env.NEXTAUTH_URL || "https://abc-senthese.vercel.app"
  const fullActionUrl = actionUrl ? (actionUrl.startsWith("http") ? actionUrl : `${baseUrl}${actionUrl}`) : undefined

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ABC Synthèse</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f9; color: #1e293b;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 32px; text-align: center;">
              <span style="color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: 1px;">ABC SYNTHÈSE</span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">${title}</h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                Bonjour ${greetingName},<br>${message}
              </p>

              ${
                details && details.length > 0
                  ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 12px 16px;">
                      ${details
                        .map(
                          (d) => `<tr>
                            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600; width: 40%;">${d.label}:</td>
                            <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 500;">${d.value}</td>
                          </tr>`
                        )
                        .join("")}
                    </table>`
                  : ""
              }

              ${
                fullActionUrl && actionText
                  ? `<div style="text-align: center; margin-top: 24px; margin-bottom: 16px;">
                      <a href="${fullActionUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                        ${actionText}
                      </a>
                    </div>`
                  : ""
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} ABC Synthèse. Notification automatique.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Sends a password reset email using Gmail SMTP or Resend.
 */
export async function sendPasswordResetEmail({
  to,
  userName = "",
  code,
  ttlMinutes = 15,
}: SendPasswordResetEmailParams): Promise<EmailResult> {
  const subject = `${code} est votre code de réinitialisation - ABC Synthèse`
  const html = renderPasswordResetHtml(userName, code, ttlMinutes)
  const text = `Bonjour ${userName || ""},\n\nVotre code de réinitialisation de mot de passe est: ${code}\n\nCe code est valide pendant ${ttlMinutes} minutes.`

  return sendEmailCore({ to, subject, html, text })
}

/**
 * Sends a general notification email using Gmail SMTP or Resend.
 */
export async function sendNotificationEmail({
  to,
  userName = "",
  subject,
  title,
  message,
  details,
  actionUrl,
  actionText,
}: SendNotificationEmailParams): Promise<EmailResult> {
  const html = renderNotificationHtml(userName, title, message, details, actionUrl, actionText)
  const text = `Bonjour ${userName || ""},\n\n${message}`

  return sendEmailCore({ to, subject, html, text })
}
