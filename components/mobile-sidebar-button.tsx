"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { AppSidebarContent } from "./app-sidebar-content"

interface MobileSidebarButtonProps {
  role?: "ADMIN" | "INSTRUMENTISTE" | null
  email?: string | null
}

export function MobileSidebarButton({ role, email }: MobileSidebarButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex lg:hidden h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white transition-colors hover:bg-white/10"
        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle>ABC SYNTHESE</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-full">
            <AppSidebarContent role={role} email={email} onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
