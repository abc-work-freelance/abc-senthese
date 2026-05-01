"use client"

import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  FileText,
  ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoutModal } from "./elements/Logout-Modal"

type SidebarRole = "ADMIN" | "INSTRUMENTISTE"

interface AppSidebarContentProps {
  role?: SidebarRole | null
  email?: string | null
  onNavigate?: () => void
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
  count,
  tone,
  onNavigate,
}: {
  href?: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  count?: number
  tone?: "teal" | "blue"
  onNavigate?: () => void
}) {
  const content = (
    <div
      className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
      style={{
        backgroundColor: active ? "#EBF9F5" : "transparent",
        color: active ? "#0D7B5F" : "#1A2332",
      }}
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </span>
      {typeof count === "number" && (
        <span
          className="inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{
            backgroundColor: tone === "blue" ? "#EAF2FF" : "#ECFDF7",
            color: tone === "blue" ? "#2563EB" : "#0D7B5F",
          }}
        >
          {count}
        </span>
      )}
    </div>
  )

  if (!href) {
    return content
  }

  return (
    <Link href={href} onClick={onNavigate}>
      {content}
    </Link>
  )
}

export function AppSidebarContent({ role, email, onNavigate }: AppSidebarContentProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="px-5 py-5">
        <div className="rounded-2xl border border-[#E8ECF0] bg-[#F8FAFC] px-4 py-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--med-text-muted)" }}>
            Navigation
          </div>
          <div className="mt-1 text-sm" style={{ color: "var(--med-text-secondary)" }}>
            {role === "ADMIN" ? "Admin workspace" : "Clinical workspace"}
          </div>
          <div className="mt-3 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ backgroundColor: "#EBF9F5", color: "#0D7B5F" }}>
            ABC SYNTHESE
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 px-5 pb-5">
        <div className="space-y-2">
          <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--med-text-muted)" }}>
            Overview
          </div>
          <div className="space-y-1">
            <SidebarLink href="/dashboard" label="Dashboard" icon={LayoutDashboard} active={pathname === "/dashboard"} onNavigate={onNavigate} />
            {/* <SidebarLink href="/dashboard#commands" label="Commands" icon={FileText} active={pathname === "/dashboard"} count={12} onNavigate={onNavigate} /> */}
            {/* <SidebarLink label="Interventions" icon={FileText} /> */}
            {/* <SidebarLink label="Schedule" icon={FileText} count={3} tone="blue" /> */}
          </div>
        </div>

        <div className="space-y-2">
          <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--med-text-muted)" }}>
            Inventory
          </div>
          <div className="space-y-1">
            <SidebarLink href="/dashboard/products" label="Products" icon={Package} active={pathname === "/dashboard/products"} onNavigate={onNavigate} />
            {/* <SidebarLink label="Catalog" icon={Package} /> */}
          </div>
        </div>

        {role === "ADMIN" && (
          <div className="space-y-2">
            <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--med-text-muted)" }}>
              Admin
            </div>
            <div className="space-y-1">
              {/* <SidebarLink label="Team" icon={FileText} /> */}
              <SidebarLink href="/dashboard/permissions" label="Permissions" icon={ShieldCheck} active={pathname === "/dashboard/permissions"} onNavigate={onNavigate} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto border-t px-5 py-4" style={{ borderColor: "var(--med-border)" }}>
        <div className="rounded-xl border border-[#E8ECF0] bg-[#F8FAFC] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundImage: "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)" }}>
              <span className="text-xs font-semibold text-white">{(email || "ON").slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold" style={{ color: "var(--med-text-primary)" }}>
                {role === "ADMIN" ? "Admin" : "Instrumentiste"}
              </div>
              <div className="truncate text-xs" style={{ color: "var(--med-text-muted)" }}>
                {email || "Signed in"}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Link href="/dashboard/settings" className="mb-2 block" onClick={onNavigate}>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-[#E8ECF0] bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-[#F8FAFC]"
                style={{ color: "#0D1B2E" }}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </Link>
            <LogoutModal>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-[#E8ECF0] bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-[#F8FAFC]"
                style={{ color: "#0D1B2E" }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </LogoutModal>
          </div>
        </div>
      </div>
    </div>
  )
}
