import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  LogOut,
  FileText
} from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UserRole } from "@/app/generated/prisma/client"

export async function AppSidebar() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                AB
            </div>
            <span className="font-semibold text-lg truncate">ABC App</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {role === UserRole.ADMIN && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Commands">
                      <Link href="/dashboard/commands">
                        <FileText />
                        <span>Commands</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Products">
                      <Link href="/dashboard/products">
                        <Package />
                        <span>Products</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              {role === UserRole.INSTRUMENTISTE && (
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="My Commands">
                      <Link href="/dashboard/commands">
                        <FileText />
                        <span>My Commands</span>
                      </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton asChild tooltip="Sign Out">
                <Link href="/api/auth/signout">
                    <LogOut />
                    <span>Sign Out</span>
                </Link>
             </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
