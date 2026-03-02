"use client"

import { useEffect } from "react"

async function registerPush() {
  if (typeof window === "undefined") return
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return

  const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!publicVapidKey) return

  try {
    const registration = await navigator.serviceWorker.register("/push-sw.js")

    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      const convertedKey = urlBase64ToUint8Array(publicVapidKey)
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      })
    }

    await fetch("/api/push-subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys,
        userAgent: navigator.userAgent,
      }),
    })
  } catch (e) {
    console.error("Failed to register push", e)
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushNotificationsClient() {
  useEffect(() => {
    registerPush()
  }, [])

  return null
}

