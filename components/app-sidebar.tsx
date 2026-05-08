"use client"

import { AppSidebarContent } from "./app-sidebar-content"

type SidebarRole = "ADMIN" | "INSTRUMENTISTE"

type AppSidebarProps = {
  role?: SidebarRole | null
  email?: string | null
  isSuperAdmin?: boolean
}

export function AppSidebar({ role, email, isSuperAdmin }: AppSidebarProps) {
  return (
    <aside className="hidden min-h-screen border-r bg-white lg:flex lg:flex-col" style={{ borderColor: "var(--med-border)" }}>
      <AppSidebarContent role={role} email={email} isSuperAdmin={isSuperAdmin} />
    </aside>
  )
}
