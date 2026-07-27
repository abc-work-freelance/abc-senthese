"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"

export function NotificationsClient() {
  const { data: session } = useSession()
  const userId = session?.user?.id ? Number(session.user.id) : null
  const role = session?.user?.role as string | undefined

  useEffect(() => {
    if (typeof window === "undefined") return

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {
        // ignore
      })
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    const wsUrl = `${protocol}://${window.location.host}/api/ws`
    const socket = new WebSocket(wsUrl)

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type !== "entity_change") return

        const { entity, action, id, targetUserId } = data.payload as {
          entity: "command" | "product"
          action: "created" | "updated" | "deleted" | "status_changed"
          id: number
          targetUserId?: number
        }

        // Admins don't get native browser notifications for commands
        if (role === "ADMIN" && entity === "command") return

        // Instrumentistes only get notifications for commands assigned to them
        if (entity === "command" && targetUserId && targetUserId !== userId) return

        const title =
          entity === "command"
            ? "Command update"
            : "Product update"

        let body = ""
        if (entity === "command") {
          body = `Command #${id} ${action.replace("_", " ")}`
        } else {
          body = `Product #${id} ${action}`
        }

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(title, { body })
        }
      } catch {
        // ignore malformed messages
      }
    }

    return () => {
      socket.close()
    }
  }, [userId, role])

  return null
}
