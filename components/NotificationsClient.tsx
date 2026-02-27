"use client"

import { useEffect } from "react"

export function NotificationsClient() {
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

        const { entity, action, id } = data.payload as {
          entity: "command" | "product"
          action: "created" | "updated" | "deleted" | "status_changed"
          id: number
        }

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
  }, [])

  return null
}

