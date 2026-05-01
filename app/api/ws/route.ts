import { NextRequest, NextResponse } from "next/server"
import { registerClient, unregisterClient } from "@/lib/ws-notify"

export const GET = async (req: NextRequest) => {
  // Check if this is a valid WebSocket upgrade request
  if (req.headers.get("upgrade") !== "websocket") {
    return new NextResponse("Expected Upgrade header", { status: 426 })
  }

  try {
    // @ts-ignore - socket type is provided by Next.js runtime
    const socket = await req.upgrade()

    // Accept and register the WebSocket connection
    // @ts-ignore
    registerClient(socket)

    // @ts-ignore
    socket.addEventListener("close", () => {
      // @ts-ignore
      unregisterClient(socket)
    })

    // Return success response for WebSocket upgrade
    return new NextResponse(null, { status: 101 })
  } catch (error) {
    return new NextResponse("WebSocket upgrade failed", { status: 500 })
  }
}

