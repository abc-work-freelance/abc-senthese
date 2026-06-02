import { AppSidebar } from "@/components/app-sidebar"
import { MobileSidebarButton } from "@/components/mobile-sidebar-button"
import { Topbar } from "@/components/dashboard/Topbar"
import { Providers } from "@/components/Providers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/app/generated/prisma/client"

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
  }

  return email?.slice(0, 2).toUpperCase() ?? "ON"
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  const name = session?.user?.name
  const email = session?.user?.email
  const userId = session?.user?.id
  const initials = getInitials(name, email)
  const isSuperAdmin = !!process.env.EMAILADMIN && email === process.env.EMAILADMIN

  // Nav badge counts — scoped to the signed-in user where relevant.
  const commandWhere =
    role === UserRole.INSTRUMENTISTE && userId ? { instrumentisteId: parseInt(userId) } : undefined

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const [commandsCount, interventionsToday, approvals] = await Promise.all([
    prisma.command.count({ where: commandWhere }),
    prisma.command.count({
      where: { ...commandWhere, dateIntervention: { gte: startOfDay, lt: endOfDay } },
    }),
    isSuperAdmin ? prisma.user.count({ where: { approved: false } }) : Promise.resolve(0),
  ])

  const counts = { commands: commandsCount, interventionsToday, approvals }
  const sidebarProps = { role, email, name, initials, isSuperAdmin, counts }

  return (
    <Providers>
      <div className="app">
        <AppSidebar {...sidebarProps} />

        <div className="main">
          <Topbar leading={<MobileSidebarButton {...sidebarProps} />} />

          <div className="scroll">
            <div className="content">{children}</div>
          </div>
        </div>
      </div>
    </Providers>
  )
}
