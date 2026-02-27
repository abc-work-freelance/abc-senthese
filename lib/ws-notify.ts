export type EntityChangeNotification = {
  entity: "command" | "product"
  action: "created" | "updated" | "deleted" | "status_changed"
  id: number
}

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
}

