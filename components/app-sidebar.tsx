import { AppSidebarContent, type SidebarCounts } from "./app-sidebar-content"

type SidebarRole = "ADMIN" | "INSTRUMENTISTE"

type AppSidebarProps = {
  role?: SidebarRole | null
  email?: string | null
  name?: string | null
  initials?: string
  isSuperAdmin?: boolean
  counts?: SidebarCounts
}

export function AppSidebar(props: AppSidebarProps) {
  return (
    <aside className="sidebar hidden md:flex">
      <AppSidebarContent {...props} />
    </aside>
  )
}
