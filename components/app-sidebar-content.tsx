"use client"

import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  UserCheck,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LogoutModal } from "./elements/Logout-Modal"

type SidebarRole = "ADMIN" | "INSTRUMENTISTE"

export interface SidebarCounts {
  commands?: number
  interventionsToday?: number
  approvals?: number
}

interface AppSidebarContentProps {
  role?: SidebarRole | null
  email?: string | null
  name?: string | null
  initials?: string
  isSuperAdmin?: boolean
  counts?: SidebarCounts
  onNavigate?: () => void
}

type NavEntry = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  accent?: boolean
  exact?: boolean
}

function NavItem({
  entry,
  pathname,
  onNavigate,
}: {
  entry: NavEntry
  pathname: string
  onNavigate?: () => void
}) {
  const Icon = entry.icon
  const target = entry.href.split("#")[0]
  const active = entry.exact ? pathname === target : pathname.startsWith(target)

  return (
    <Link href={entry.href} className={`nav-item${active ? " active" : ""}`} onClick={onNavigate}>
      <Icon />
      {entry.label}
      {typeof entry.badge === "number" && entry.badge > 0 && (
        <span className={`nav-badge${entry.accent ? " accent" : ""}`}>{entry.badge}</span>
      )}
    </Link>
  )
}

export function AppSidebarContent({
  role,
  email,
  name,
  initials,
  isSuperAdmin,
  counts,
  onNavigate,
}: AppSidebarContentProps) {
  const pathname = usePathname()
  const isAdmin = role === "ADMIN"

  const overview: NavEntry[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    {
      href: "/dashboard#schedule",
      label: "Interventions",
      icon: CalendarDays,
      badge: counts?.interventionsToday,
      accent: true,
    },
  ]

  const operations: NavEntry[] = [
    { href: "/dashboard#commands", label: "Commands", icon: ClipboardList, badge: counts?.commands },
    { href: "/dashboard/products", label: "Products", icon: Package },
  ]

  const administration: NavEntry[] = []
  if (isAdmin) administration.push({ href: "/dashboard/permissions", label: "Permissions", icon: ShieldCheck })
  if (isSuperAdmin)
    administration.push({ href: "/dashboard/approvals", label: "Approvals", icon: UserCheck, badge: counts?.approvals })

  return (
    <>
      <div className="brand">
        <span className="brand-logo-chip">
          <Image src="/assets/abc-logo.png" alt="ABC Synthese — prosthetics management" width={51} height={34} priority />
        </span>
      </div>

      <nav className="nav">
        <div className="nav-group" style={{ marginTop: 4 }}>
          <div className="nav-label">Overview</div>
          {overview.map((entry) => (
            <NavItem key={entry.label} entry={entry} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="nav-group">
          <div className="nav-label">Operations</div>
          {operations.map((entry) => (
            <NavItem key={entry.label} entry={entry} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>

        {administration.length > 0 && (
          <div className="nav-group">
            <div className="nav-label">Administration</div>
            {administration.map((entry) => (
              <NavItem key={entry.label} entry={entry} pathname={pathname} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </nav>

      <div className="side-foot">
        <div className="user-card">
          <span className="avatar">{initials || "ON"}</span>
          <span className="user-meta">
            <span className="user-name">{name || email || "ABC Synthese user"}</span>
            <span className="user-role">{isAdmin ? "Administrator" : "Instrumentiste"}</span>
          </span>
          <Link href="/dashboard/settings" className="icon-btn-ghost" title="Settings" onClick={onNavigate}>
            <Settings />
          </Link>
          <LogoutModal>
            <button className="icon-btn-ghost" title="Sign out" type="button">
              <LogOut />
            </button>
          </LogoutModal>
        </div>
      </div>
    </>
  )
}
