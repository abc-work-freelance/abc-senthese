import "dotenv/config";

// WhatsApp notifications via the Meta WhatsApp Business Cloud API (free tier).

function getWhatsAppConfig() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0"
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || "fr"
  const resetTemplateName = process.env.WHATSAPP_RESET_TEMPLATE_NAME || templateName

  return {
    phoneNumberId,
    accessToken,
    apiVersion,
    templateName,
    templateLang,
    resetTemplateName,
  }
}

export function isWhatsAppConfigured(): boolean {
  const { phoneNumberId, accessToken } = getWhatsAppConfig()
  return Boolean(phoneNumberId && accessToken)
}

export type WhatsAppResult = {
  success: boolean
  skipped?: boolean
  message?: string
  data?: unknown
}

/**
 * WhatsApp expects recipient phone numbers in E.164 format without "+".
 * E.g., Moroccan numbers (+212) should be 2126xxxxxxx or 2127xxxxxxx.
 */
function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "")
  const defaultCountryCode = process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "212"

  // Local Moroccan format with leading 0: "0669609873" -> "212669609873"
  if (digits.length === 10 && digits.startsWith("0")) {
    digits = defaultCountryCode + digits.slice(1)
  }
  // Local Moroccan format without leading 0: "669609873" -> "212669609873"
  else if (digits.length === 9 && (digits.startsWith("6") || digits.startsWith("7"))) {
    digits = defaultCountryCode + digits
  }

  return digits
}

async function postToGraph(payload: Record<string, unknown>): Promise<WhatsAppResult> {
  const { phoneNumberId, accessToken, apiVersion } = getWhatsAppConfig()

  if (!phoneNumberId || !accessToken) {
    console.warn("[whatsapp] missing WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN")
    return { success: false, skipped: true, message: "WhatsApp credentials not set" }
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    )

    const rawBody = await res.text()

    if (!res.ok) {
      console.error("[whatsapp] send failed:", res.status, rawBody)
      return { success: false, message: rawBody }
    }

    console.log("[whatsapp] send success:", rawBody)
    let parsed: unknown = rawBody
    try {
      parsed = JSON.parse(rawBody)
    } catch {}

    return { success: true, data: parsed }
  } catch (error) {
    console.error("[whatsapp] request error:", error)
    return { success: false, message: "Request failed" }
  }
}

/**
 * Send a plain text WhatsApp message. Only delivered if the recipient is within
 * the 24h customer-service window.
 */
export async function sendWhatsAppText(to: string, body: string): Promise<WhatsAppResult> {
  if (!isWhatsAppConfigured()) {
    console.warn("[whatsapp] not configured (missing WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN); skipping")
    return { success: false, skipped: true }
  }

  const phone = normalizePhone(to)
  if (!phone) {
    return { success: false, message: "Invalid phone number" }
  }

  return postToGraph({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phone,
    type: "text",
    text: { preview_url: false, body },
  })
}

export type TemplateParam = string | { name: string; text: string }

/**
 * Send an approved template message. Supports both named parameters (e.g. {{msg}})
 * and positional parameters (e.g. {{1}}).
 */
/**
 * Send an approved template message. Supports both named parameters (e.g. {{msg}})
 * and positional parameters (e.g. {{1}}).
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  bodyParams: TemplateParam[],
  langCode?: string
): Promise<WhatsAppResult> {
  const config = getWhatsAppConfig()
  const lang = langCode || config.templateLang

  if (!isWhatsAppConfigured()) {
    console.warn("[whatsapp] not configured; skipping")
    return { success: false, skipped: true }
  }

  const phone = normalizePhone(to)
  if (!phone) {
    return { success: false, message: "Invalid phone number" }
  }

  // 1) Format with `parameter_name` for named parameters (e.g. {{msg}})
  const namedParams = bodyParams.map((param) => {
    if (typeof param === "string") {
      return { type: "text", parameter_name: "msg", text: param }
    }
    return { type: "text", parameter_name: param.name, text: param.text }
  })

  const res1 = await postToGraph({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phone,
    type: "template",
    template: {
      name: templateName,
      language: { code: lang },
      components: [
        {
          type: "body",
          parameters: namedParams,
        },
      ],
    },
  })

  if (res1.success) return res1

  // 2) Fallback to positional parameters without `parameter_name` if template expects {{1}}
  if (res1.message?.includes("Parameter name") || res1.message?.includes("Invalid parameter")) {
    const positionalParams = bodyParams.map((param) => ({
      type: "text",
      text: typeof param === "string" ? param : param.text,
    }))

    return postToGraph({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "template",
      template: {
        name: templateName,
        language: { code: lang },
        components: [
          {
            type: "body",
            parameters: positionalParams,
          },
        ],
      },
    })
  }

  return res1
}

/**
 * Send a generic notification using the single-parameter template:
 * "Hello, here is your update from ABC SENTHESE: {{msg}}\nHave a good day."
 */
export async function sendWhatsAppNotification(to: string, msg: string): Promise<WhatsAppResult> {
  const { templateName, resetTemplateName } = getWhatsAppConfig()
  const activeTemplate = templateName || resetTemplateName
  if (activeTemplate) {
    const templateResult = await sendWhatsAppTemplate(to, activeTemplate, [msg])
    if (templateResult.success) return templateResult
    console.warn("[whatsapp] template send failed, falling back to plain text")
  }

  return sendWhatsAppText(to, msg)
}

/**
 * Send a password-reset code to a user over WhatsApp using the single-parameter template:
 * "Hello, here is your update from ABC SENTHESE: {{msg}}\nHave a good day."
 */
export async function notifyPasswordReset(
  phone: string | null | undefined,
  name: string,
  code: string,
  ttlMinutes: number
): Promise<WhatsAppResult> {
  if (!phone) {
    return { success: false, skipped: true, message: "No phone number on file" }
  }

  // Content for {{msg}} template parameter
  const resetMsg = `Votre code de réinitialisation de mot de passe est : ${code} (valable ${ttlMinutes} minutes).`

  const { resetTemplateName, templateName } = getWhatsAppConfig()
  const resetTemplate = resetTemplateName || templateName
  if (resetTemplate) {
    const templateResult = await sendWhatsAppTemplate(phone, resetTemplate, [resetMsg])
    if (templateResult.success) return templateResult
    console.warn("[whatsapp] reset template send failed, falling back to plain text")
  }

  // Fallback plain text for 24h window
  const text =
    `Bonjour ${name},\n\n` +
    `Vous avez demandé à réinitialiser votre mot de passe sur la plateforme ABC Synthèse.\n\n` +
    `• Code de vérification : *${code}*\n` +
    `• Valable ${ttlMinutes} minutes\n\n` +
    `Saisissez ce code pour définir un nouveau mot de passe. ` +
    `Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n\n` +
    `Cordialement,\nL'équipe ABC Synthèse`

  return sendWhatsAppText(phone, text)
}

export type AssignmentNotification = {
  instrumentistePhone: string | null | undefined
  instrumentisteName: string
  adminName: string
  reference: string
  assignedAt: Date
}

/** Human-readable French date/time, e.g. "1 juin 2026 à 22:30". */
function formatFrenchDateTime(date: Date): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: process.env.WHATSAPP_TIMEZONE || "Africa/Casablanca",
    }).format(date)
  } catch {
    return date.toISOString()
  }
}

/**
 * Notify an instrumentiste that a command has been assigned to them using the single-parameter template:
 * "Hello, here is your update from ABC SENTHESE: {{msg}}\nHave a good day."
 */
export async function notifyCommandAssignment(
  data: AssignmentNotification
): Promise<WhatsAppResult> {
  const { instrumentistePhone, instrumentisteName, adminName, reference, assignedAt } = data

  if (!instrumentistePhone) {
    console.warn(`[whatsapp] instrumentiste has no phone number; skipping notification for command ${reference}`)
    return { success: false, skipped: true }
  }

  const when = formatFrenchDateTime(assignedAt)

  // Content for {{msg}} template parameter
  const assignmentMsg = `Bonjour ${instrumentisteName}, la commande ${reference} vous a été affectée par ${adminName} le ${when}.`

  // 1) Try the approved template (works for business-initiated messages).
  const { templateName, resetTemplateName } = getWhatsAppConfig()
  const activeTemplate = templateName || resetTemplateName
  if (activeTemplate) {
    const templateResult = await sendWhatsAppTemplate(instrumentistePhone, activeTemplate, [assignmentMsg])
    if (templateResult.success) return templateResult
    console.warn("[whatsapp] template send failed, falling back to plain text")
  }

  // 2) Fall back to plain text (delivers within the 24h window).
  const text =
    `Bonjour ${instrumentisteName},\n\n` +
    `Une nouvelle commande vous a été affectée sur la plateforme ABC Synthèse.\n\n` +
    `• Référence : *${reference}*\n` +
    `• Affectée par : ${adminName}\n` +
    `• Date d'affectation : ${when}\n\n` +
    `Merci de consulter votre espace ABC Synthèse afin d'en prendre connaissance et d'organiser l'intervention.\n\n` +
    `Cordialement,\nL'équipe ABC Synthèse`

  return sendWhatsAppText(instrumentistePhone, text)
}

