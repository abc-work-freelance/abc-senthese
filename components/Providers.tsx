"use client"

import { SessionProvider } from "next-auth/react"
import { NotificationsClient } from "@/components/NotificationsClient"
import { ToastProvider } from "@/components/ui/toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <NotificationsClient />
        {children}
      </ToastProvider>
    </SessionProvider>
  )
}
