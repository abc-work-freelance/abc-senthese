// WhatsApp notifications via the Meta WhatsApp Business Cloud API (free tier).
//
// Required environment variables:
//   WHATSAPP_PHONE_NUMBER_ID   The phone number ID from your Meta WhatsApp app
//   WHATSAPP_ACCESS_TOKEN      A permanent/system-user access token
// Optional:
//   WHATSAPP_API_VERSION       Graph API version (default: v21.0)
//   WHATSAPP_TEMPLATE_NAME     Name of an APPROVED message template (recommended)
//   WHATSAPP_TEMPLATE_LANG     Template language code (default: fr)
//
// Business-initiated messages (like an assignment notification) can only be
// delivered as plain text if the recipient messaged the business number within
// the last 24h. Outside that window Meta requires an APPROVED template. We try
// the template first (when configured) and fall back to plain text.

const GRAPH_API_VERSION = process.env.WHATSAPP_API_VERSION || "v21.0"
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME
const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "fr"

export function isWhatsAppConfigured(): boolean {
  return Boolean(PHONE_NUMBER_ID && ACCESS_TOKEN)
}

type WhatsAppResult = {
  success: boolean
  skipped?: boolean
  message?: string
}

// WhatsApp expects the recipient in E.164 form WITHOUT the leading "+".
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits
}

async function postToGraph(payload: Record<string, unknown>): Promise<WhatsAppResult> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    )

    if (!res.ok) {
      const errorBody = await res.text()
      console.error("[whatsapp] send failed:", res.status, errorBody)
      return { success: false, message: errorBody }
    }

    return { success: true }
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

/**
 * Send an approved template message with positional body parameters.
 * Use this for business-initiated notifications.
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  bodyParams: string[],
  langCode: string = TEMPLATE_LANG
): Promise<WhatsAppResult> {
  if (!isWhatsAppConfigured()) {
    console.warn("[whatsapp] not configured; skipping")
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
    type: "template",
    template: {
      name: templateName,
      language: { code: langCode },
      components: [
        {
          type: "body",
          parameters: bodyParams.map((text) => ({ type: "text", text })),
        },
      ],
    },
  })
}

type AssignmentNotification = {
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
 * Notify an instrumentiste (in French) that a command has been assigned to them.
 * Tries the configured template first, then falls back to a plain text message.
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

  // Professional French message.
  const text =
    `Bonjour ${instrumentisteName},\n\n` +
    `Une nouvelle commande vous a été affectée sur la plateforme ABC Synthèse.\n\n` +
    `• Référence : *${reference}*\n` +
    `• Affectée par : ${adminName}\n` +
    `• Date d'affectation : ${when}\n\n` +
    `Merci de consulter votre espace ABC Synthèse afin d'en prendre connaissance et d'organiser l'intervention.\n\n` +
    `Cordialement,\nL'équipe ABC Synthèse`

  // 1) Try the approved template (works for business-initiated messages).
  if (TEMPLATE_NAME) {
    const templateResult = await sendWhatsAppTemplate(instrumentistePhone, TEMPLATE_NAME, [
      instrumentisteName,
      adminName,
      reference,
      when,
    ])
    if (templateResult.success) return templateResult
    console.warn("[whatsapp] template send failed, falling back to plain text")
  }

  // 2) Fall back to plain text (delivers within the 24h window).
  return sendWhatsAppText(instrumentistePhone, text)
}
