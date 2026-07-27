import { NextResponse } from "next/server"

/**
 * GET /api/whatsapp/webhook
 * Meta Webhook verification handshake.
 * When you configure your Webhook in Meta Developer Portal, Meta sends a GET
 * request with hub.challenge, hub.mode, and hub.verify_token.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "abc_senthese_verify_token_2026"

  if (mode === "subscribe" && token === expectedToken) {
    console.log("[whatsapp-webhook] Webhook verified successfully!")
    return new Response(challenge, { status: 200 })
  }

  console.warn("[whatsapp-webhook] Webhook verification failed: token mismatch")
  return new Response("Forbidden", { status: 403 })
}

/**
 * POST /api/whatsapp/webhook
 * Receives real-time events from WhatsApp Cloud API (message status updates & incoming messages).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.object === "whatsapp_business_account") {
      const entries = body.entry || []

      for (const entry of entries) {
        const changes = entry.changes || []

        for (const change of changes) {
          const value = change.value

          // Handle message delivery status updates (sent, delivered, read, failed)
          if (value?.statuses) {
            for (const status of value.statuses) {
              console.log(
                `[whatsapp-webhook] Message Status Update -> ID: ${status.id}, Status: ${status.status}, Recipient: ${status.recipient_id}`
              )
              if (status.errors) {
                console.error(`[whatsapp-webhook] Delivery Error:`, JSON.stringify(status.errors))
              }
            }
          }

          // Handle incoming messages from users
          if (value?.messages) {
            for (const msg of value.messages) {
              console.log(
                `[whatsapp-webhook] Incoming Message -> From: ${msg.from}, Type: ${msg.type}, Text:`,
                msg.text?.body || msg
              )
            }
          }
        }
      }
    }

    // Return 200 OK to acknowledge receipt to Meta
    return NextResponse.json({ status: "ok" }, { status: 200 })
  } catch (error) {
    console.error("[whatsapp-webhook] Error processing webhook:", error)
    return NextResponse.json({ status: "ok" }, { status: 200 })
  }
}
