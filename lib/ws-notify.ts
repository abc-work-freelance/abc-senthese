export type EntityChangeNotification = {
  entity: "command" | "product"
  action: "created" | "updated" | "deleted" | "status_changed"
  id: number
}

import { prisma } from "@/lib/prisma"
import { webPush } from "@/lib/web-push"

type SocketClient = {
  send: (data: string) => void
}

const clients = new Set<SocketClient>()

export function registerClient(socket: SocketClient) {
  clients.add(socket)
}

export function unregisterClient(socket: SocketClient) {
  clients.delete(socket)
}

export function broadcastEntityChange(payload: EntityChangeNotification) {
  const message = JSON.stringify({
    type: "entity_change",
    payload,
  })

  for (const client of clients) {
    try {
      client.send(message)
    } catch {
      // Ignore send errors
    }
  }

  // Also send web-push notifications if configured
  if (webPush) {
    sendPushNotifications(payload).catch(() => {
      // ignore push errors
    })
  }
}

async function sendPushNotifications(payload: EntityChangeNotification) {
  const subscriptions = await prisma.pushSubscription.findMany()

  const title =
    payload.entity === "command" ? "Command update" : "Product update"

  const body =
    payload.entity === "command"
      ? `Command #${payload.id} ${payload.action.replace("_", " ")}`
      : `Product #${payload.id} ${payload.action}`

  const data = {
    title,
    body,
    payload,
  }

  for (const sub of subscriptions) {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }

    try {
      await webPush.sendNotification(pushSubscription as any, JSON.stringify(data))
    } catch (error: any) {
      // 410 = Gone, 404 = Not Found -> remove invalid subscription
      if (error?.statusCode === 410 || error?.statusCode === 404) {
        await prisma.pushSubscription.delete({
          where: { endpoint: sub.endpoint },
        })
      }
    }
  }
}


