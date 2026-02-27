import { NextRequest, NextResponse } from "next/server"
import { registerClient, unregisterClient } from "@/lib/ws-notify"

export const GET = async (_req: NextRequest) => {
  const [socket, response] = NextResponse.upgrade()

  // Accept and register the WebSocket connection
  // @ts-ignore - socket type is provided by Next.js runtime
  socket.accept()
  // @ts-ignore
  registerClient(socket)

  // @ts-ignore
  socket.addEventListener("close", () => {
    // @ts-ignore
    unregisterClient(socket)
  })

  return response
}

