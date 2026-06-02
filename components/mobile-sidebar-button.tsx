"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { AppSidebarContent, type SidebarCounts } from "./app-sidebar-content"

interface MobileSidebarButtonProps {
  role?: "ADMIN" | "INSTRUMENTISTE" | null
  email?: string | null
  name?: string | null
  initials?: string
  isSuperAdmin?: boolean
  counts?: SidebarCounts
}

export function MobileSidebarButton(props: MobileSidebarButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="tbtn md:hidden"
        aria-label="Open menu"
        type="button"
      >
        <Menu strokeWidth={2} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="sidebar w-64 border-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebarContent {...props} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
