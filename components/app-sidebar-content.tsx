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
import { useEffect, useState } from "react"
import { LogoutModal } from "./elements/Logout-Modal"

// The dashboard, interventions and commands "tabs" are all anchors on the same
// /dashboard page, so highlighting can't rely on the pathname alone — we also
// need the current hash to keep exactly one item active at a time.
function useCurrentHash() {
  const pathname = usePathname()
  const [hash, setHash] = useState("")

  // Re-read on hash changes AND on pathname changes — a route change to a
  // hash-less URL doesn't always fire `hashchange`, which would otherwise leave
  // a stale hash and keep the wrong tab highlighted.
  useEffect(() => {
    const update = () => setHash(window.location.hash)
    update()
    window.addEventListener("hashchange", update)
    return () => window.removeEventListener("hashchange", update)
  }, [pathname])

  return hash
}

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
  currentHash,
  onNavigate,
}: {
  entry: NavEntry
  pathname: string
  currentHash: string
  onNavigate?: () => void
}) {
  const Icon = entry.icon
  const [target, hashPart] = entry.href.split("#")
  const targetHash = hashPart ? `#${hashPart}` : ""

  let active: boolean
  if (targetHash) {
    // Anchor tab (e.g. #commands): active only when its hash is selected.
    active = pathname === target && currentHash === targetHash
  } else if (entry.exact) {
    // Plain dashboard: active only with no hash, so anchor tabs don't steal it.
    active = pathname === target && !currentHash
  } else {
    active = pathname.startsWith(target)
  }

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
  const currentHash = useCurrentHash()
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
  ]
  // Products is an admin-only page (also enforced in middleware), so an
  // instrumentiste should never see the nav entry for it.
  if (isAdmin) operations.push({ href: "/dashboard/products", label: "Products", icon: Package })

  const administration: NavEntry[] = []
  if (isAdmin) administration.push({ href: "/dashboard/permissions", label: "Permissions", icon: ShieldCheck })
  if (isSuperAdmin)
    administration.push({ href: "/dashboard/approvals", label: "Approvals", icon: UserCheck, badge: counts?.approvals })

  return (
    <>
      <div className="brand">
        <Image
          className="brand-logo"
          src="/assets/abc-logo-light.png"
          alt="ABC Synthese — prosthetics management"
          width={909}
          height={602}
          priority
        />
      </div>

      <nav className="nav">
        <div className="nav-group" style={{ marginTop: 4 }}>
          <div className="nav-label">Overview</div>
          {overview.map((entry) => (
            <NavItem key={entry.label} entry={entry} pathname={pathname} currentHash={currentHash} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="nav-group">
          <div className="nav-label">Operations</div>
          {operations.map((entry) => (
            <NavItem key={entry.label} entry={entry} pathname={pathname} currentHash={currentHash} onNavigate={onNavigate} />
          ))}
        </div>

        {administration.length > 0 && (
          <div className="nav-group">
            <div className="nav-label">Administration</div>
            {administration.map((entry) => (
              <NavItem key={entry.label} entry={entry} pathname={pathname} currentHash={currentHash} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </nav>

      <div className="side-foot">
        <div className="user-panel">
          <div className="user-card">
            <span className="avatar">{initials || "ON"}</span>
            <span className="user-meta">
              <span className="user-name">{isAdmin ? "Administrator" : "Instrumentiste"}</span>
              <span className="user-role">{email || name || "ABC Synthese user"}</span>
            </span>
          </div>
          <div className="user-actions">
            <Link href="/dashboard/settings" className="user-action" title="Settings" onClick={onNavigate}>
              <Settings />
              <span>Settings</span>
            </Link>
            <LogoutModal>
              <button className="user-action" title="Sign out" type="button">
                <LogOut />
                <span>Sign Out</span>
              </button>
            </LogoutModal>
          </div>
        </div>
      </div>
    </>
  )
}
