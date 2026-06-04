"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, CheckCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type NotificationItem = {
  id: string
  title: string
  body: string
  href?: string
  ts: number
  read: boolean
}

type EntityChangePayload = {
  entity: "command" | "product"
  action: "created" | "updated" | "deleted" | "status_changed"
  id: number
}

const STORAGE_KEY = "abc-notifications"
const MAX_ITEMS = 30

function buildNotification(payload: EntityChangePayload): NotificationItem {
  const { entity, action, id } = payload
  const title = entity === "command" ? "Command update" : "Product update"
  const body =
    entity === "command"
      ? `Command #${id} ${action.replace("_", " ")}`
      : `Product #${id} ${action}`
  const href = entity === "command" ? "/dashboard#commands" : "/dashboard/products"

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    body,
    href,
    ts: Date.now(),
    read: false,
  }
}

export function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Load persisted history once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as NotificationItem[]
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [])
      }
    } catch {
      // ignore corrupt storage
    }
  }, [])

  // Persist whenever the list changes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore quota / serialization errors
    }
  }, [items])

  // Live updates over the same WebSocket the app already broadcasts on.
  useEffect(() => {
    if (typeof window === "undefined") return

    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    const socket = new WebSocket(`${protocol}://${window.location.host}/api/ws`)

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type !== "entity_change") return
        const next = buildNotification(data.payload as EntityChangePayload)
        setItems((prev) => [next, ...prev].slice(0, MAX_ITEMS))
      } catch {
        // ignore malformed messages
      }
    }

    return () => socket.close()
  }, [])

  // Close the panel when clicking outside it.
  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const unreadCount = items.filter((item) => !item.read).length

  function toggle() {
    setOpen((wasOpen) => {
      const next = !wasOpen
      // Opening the panel marks everything as read.
      if (next && unreadCount > 0) {
        setItems((prev) => prev.map((item) => ({ ...item, read: true })))
      }
      return next
    })
  }

  function markAllRead() {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  function clearAll() {
    setItems([])
  }

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button
        className="tbtn"
        type="button"
        title="Notifications"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={toggle}
      >
        {unreadCount > 0 && (
          <span className="notif-count" aria-hidden>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <Bell strokeWidth={2} />
      </button>

      {open && (
        <div className="notif-panel" role="dialog" aria-label="Notifications">
          <div className="notif-panel-head">
            <span className="notif-panel-title">Notifications</span>
            {items.length > 0 && (
              <div className="notif-panel-actions">
                <button type="button" onClick={markAllRead} title="Mark all as read">
                  <CheckCheck />
                </button>
                <button type="button" onClick={clearAll} className="notif-clear">
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="notif-list">
            {items.length === 0 ? (
              <div className="notif-empty">
                <Bell strokeWidth={1.6} />
                <span>You&apos;re all caught up</span>
              </div>
            ) : (
              items.map((item) => (
                <a
                  key={item.id}
                  className={`notif-item${item.read ? "" : " unread"}`}
                  href={item.href ?? "#"}
                  onClick={() => setOpen(false)}
                >
                  <span className="notif-item-dot" aria-hidden />
                  <span className="notif-item-body">
                    <span className="notif-item-title">{item.title}</span>
                    <span className="notif-item-text">{item.body}</span>
                    <span className="notif-item-time">
                      {formatDistanceToNow(item.ts, { addSuffix: true })}
                    </span>
                  </span>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
