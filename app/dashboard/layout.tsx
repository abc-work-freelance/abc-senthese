import { AppSidebar } from "@/components/app-sidebar"
import { Providers } from "@/components/Providers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Link from "next/link"
import { Bell, CalendarDays, ChevronDown, LayoutDashboard, Package, Search, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
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
  const initials = getInitials(name, email)

  return (
    <Providers>
      <div className="min-h-screen" style={{ backgroundColor: "var(--med-surface)" }}>
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)]">
          <AppSidebar role={role} email={email} />

          <div className="min-w-0">
            <header
              className="sticky top-0 z-30 flex h-14 items-center border-b px-4 shadow-[0_8px_24px_rgba(13,27,46,0.08)] backdrop-blur"
              style={{ backgroundColor: "var(--med-navy)" }}
            >
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg shadow-[0_8px_18px_rgba(0,196,154,0.25)]"
                      style={{
                        backgroundImage: "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)",
                      }}
                    >
                      <span className="h-3.5 w-3.5 rounded-sm bg-white/90" />
                    </span>
                    <div className="flex flex-col leading-none">
                      <span
                        className="text-lg font-semibold tracking-[0.02em] text-white"
                        style={{ fontFamily: "var(--font-dm-serif)" }}
                      >
                        ABC SYNTHESE
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00C49A]">
                        Prosthetics Management
                      </span>
                    </div>
                  </Link>

                  <nav className="hidden items-center gap-1 xl:flex">
                    {[
                      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                      { href: "/dashboard#commands", label: "Commands", icon: CalendarDays },
                      { href: "/dashboard/products", label: "Products", icon: Package },
                      { href: "/dashboard/permissions", label: "Permissions", icon: ShieldCheck },
                    ].map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href + item.label}
                          href={item.href}
                          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </nav>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-2 lg:flex" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                    <Search className="h-4 w-4 text-white/70" />
                    <Input
                      aria-label="Search"
                      placeholder="Search commands, doctors, products..."
                      className="h-6 w-72 border-0 bg-transparent px-0 text-sm text-white placeholder:text-white/45 focus-visible:ring-0"
                    />
                  </div>

                  <button
                    type="button"
                    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition-colors hover:bg-white/10"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                    aria-label="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#00C49A] shadow-[0_0_0_3px_rgba(13,27,46,0.8)]" />
                  </button>

                  <div className="flex items-center gap-3 rounded-full border border-white/10 px-2 py-1.5 text-white" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{
                        backgroundImage: "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)",
                      }}
                    >
                      {initials}
                    </span>
                    <div className="hidden flex-col text-left leading-none sm:flex">
                      <span className="text-sm font-medium text-white">{name || "ABC SYNTHESE user"}</span>
                      <span className="text-xs text-white/60">{role === UserRole.ADMIN ? "Admin" : "Instrumentiste"}</span>
                    </div>
                    <ChevronDown className="hidden h-4 w-4 text-white/70 sm:block" />
                  </div>
                </div>
              </div>
            </header>

            <main className="min-w-0 px-4 py-6 lg:px-6 xl:px-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </Providers>
  )
}
