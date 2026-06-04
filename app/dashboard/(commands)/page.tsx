import { getAllCommands } from "@/app/actions/commands"
import { getAllProducts } from "@/app/actions/products"
import { prisma } from "@/lib/prisma"
import { CommandDialog } from "@/components/commands/CommandDialog"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getEffectivePermissions } from "@/lib/permissions"
import { UserRole, CommandStatus } from "@/app/generated/prisma/client"
import { format } from "date-fns"
import { CommandsTable } from "./CommandsTable"
import CardsSection from "./CardsSection"
import { ChartsSection } from "@/components/commands/ChartsSection"
import CadenceCard from "./CadenceCard"
import RightPanel from "./RightPanel"

type DashboardCommand = {
  id: number
  reference: string
  type: "HIP" | "KNEE" | "SHOULDER"
  status: "VALIDEE" | "AFFECTEE" | "REPORTEE" | "ANNULEE" | "COMPLETEE"
  dateIntervention: Date | string
  dateLivraison: Date | string
  lienIntervention?: string | null
  updatedAt: Date | string
  ville?: string | null
  address?: string | null
  doctorName?: string | null
  clinique?: string | null
  instrumentisteId?: number | null
  completionReport?: string | null
  modePaiement?: string | null
  commentaire?: string | null
  commandProducts: {
    product: { id: number; name: string; code: string }
    quantity: number
  }[]
  instrumentiste?: {
    name: string | null
    familyName: string | null
  } | null
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function shortName(name?: string | null, familyName?: string | null) {
  const first = name?.[0]
  if (first && familyName) return `${first}. ${familyName}`
  return name || familyName || "—"
}

function initialsOf(name?: string | null, familyName?: string | null) {
  return `${name?.[0] ?? ""}${familyName?.[0] ?? ""}`.toUpperCase() || "?"
}

export default async function CommandsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q: searchQuery } = await searchParams
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  const userId = session?.user?.id
  const isAdmin = role === UserRole.ADMIN
  const permissions = isAdmin ? await getEffectivePermissions() : []
  const perms = {
    canCreate: permissions.includes("COMMAND_CREATE"),
    canUpdate: permissions.includes("COMMAND_UPDATE"),
    canDelete: permissions.includes("COMMAND_DELETE"),
    canStatus: permissions.includes("COMMAND_STATUS_UPDATE"),
  }

  let commands: DashboardCommand[] = []

  if (role === UserRole.ADMIN) {
    const res = await getAllCommands()
    commands = res.commands as DashboardCommand[]
  } else if (role === UserRole.INSTRUMENTISTE && userId) {
    const res = await getAllCommands()
    const allowedStatuses = [CommandStatus.AFFECTEE, CommandStatus.COMPLETEE, CommandStatus.ANNULEE] as const
    commands =
      (res.commands as DashboardCommand[] | undefined)?.filter(
        (command) =>
          command.instrumentisteId === parseInt(userId) &&
          allowedStatuses.includes(command.status as (typeof allowedStatuses)[number])
      ) || []
  }

  const { products } = await getAllProducts()
  const users = await prisma.user.findMany({ where: { role: UserRole.INSTRUMENTISTE } })
  const userMap = new Map(users.map((u) => [u.id, u]))

  const commandsStat = await prisma.command.findMany({
    where: role === UserRole.INSTRUMENTISTE && userId ? { instrumentisteId: parseInt(userId) } : undefined,
  })

  // ---- date scaffolding ----
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const weekFromToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  const dow = (startOfToday.getDay() + 6) % 7 // 0 = Monday
  const monday = new Date(startOfToday)
  monday.setDate(startOfToday.getDate() - dow)

  const dateOf = (c: { dateIntervention: Date | string }) => new Date(c.dateIntervention)
  const inRange = (d: Date, start: Date, end: Date) => d >= start && d < end

  // ---- prosthesis mix ----
  const typeCounts = commandsStat.reduce(
    (acc, command) => {
      if (command.type === "HIP") acc.hip += 1
      if (command.type === "KNEE") acc.knee += 1
      if (command.type === "SHOULDER") acc.shoulder += 1
      return acc
    },
    { hip: 0, knee: 0, shoulder: 0 }
  )

  // ---- KPIs ----
  const activeCommands = commandsStat.filter((c) => c.status !== "COMPLETEE" && c.status !== "ANNULEE").length
  const awaitingAssignment = commandsStat.filter((c) => c.status === "VALIDEE").length

  const todayCommands = commandsStat
    .filter((c) => c.dateIntervention && inRange(dateOf(c), startOfToday, endOfToday))
    .sort((a, b) => dateOf(a).getTime() - dateOf(b).getTime())
  const interventionsToday = todayCommands.length
  const upcomingToday = todayCommands.find((c) => dateOf(c) >= now) ?? todayCommands[0]
  const next = upcomingToday
    ? {
        time: format(dateOf(upcomingToday), "HH:mm"),
        place: upcomingToday.clinique || upcomingToday.ville || "—",
      }
    : null

  const dueThisWeekCommands = commandsStat.filter(
    (c) => c.dateIntervention && inRange(dateOf(c), startOfToday, weekFromToday)
  )
  const dueThisWeek = dueThisWeekCommands.length
  const notScheduled = dueThisWeekCommands.filter((c) => c.status === "VALIDEE").length

  const monthCommands = commandsStat.filter((c) => c.dateIntervention && inRange(dateOf(c), monthStart, monthEnd))
  const completedCount = monthCommands.filter((c) => c.status === "COMPLETEE").length
  const monthTotal = monthCommands.length
  const completionRate = monthTotal > 0 ? Math.round((completedCount / monthTotal) * 100) : 0

  const kpi = {
    activeCommands,
    awaitingAssignment,
    interventionsToday,
    next,
    dueThisWeek,
    notScheduled,
    completionRate,
    completedCount,
    monthTotal,
    monthName: format(now, "MMMM"),
  }

  // ---- cadence (this week) ----
  const days = WEEKDAYS.map((label, i) => {
    const dayStart = new Date(monday)
    dayStart.setDate(monday.getDate() + i)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayStart.getDate() + 1)
    const value = commandsStat.filter((c) => c.dateIntervention && inRange(dateOf(c), dayStart, dayEnd)).length
    return { label, value }
  })
  const scheduled = days.reduce((sum, d) => sum + d.value, 0)
  const cadence = {
    days,
    todayIndex: dow,
    scheduled,
    today: interventionsToday,
    dailyAvg: (scheduled / 7).toFixed(1),
  }

  // ---- right rail ----
  const schedule = todayCommands.map((c) => {
    const inst = c.instrumentisteId ? userMap.get(c.instrumentisteId) : null
    const place = c.clinique || c.ville || "—"
    return {
      time: format(dateOf(c), "HH:mm"),
      type: c.type,
      doctor: c.doctorName || "Intervention",
      meta: inst ? `${place} · ${shortName(inst.name, inst.familyName)}` : place,
    }
  })

  const ops = {
    awaitingValidation: commandsStat.filter((c) => c.status === "VALIDEE").length,
    reportedOnHold: commandsStat.filter((c) => c.status === "REPORTEE").length,
    cancelled30d: commandsStat.filter((c) => c.status === "ANNULEE" && new Date(c.updatedAt) >= thirtyDaysAgo).length,
    reportsPending: commandsStat.filter((c) => c.status === "COMPLETEE" && !c.completionReport).length,
  }

  const loadCounts = new Map<number, number>()
  for (const c of commandsStat) {
    if (c.status === "AFFECTEE" && c.instrumentisteId) {
      loadCounts.set(c.instrumentisteId, (loadCounts.get(c.instrumentisteId) ?? 0) + 1)
    }
  }
  const load = [...loadCounts.entries()]
    .map(([id, active]) => {
      const u = userMap.get(id)
      return { initials: initialsOf(u?.name, u?.familyName), name: shortName(u?.name, u?.familyName), active }
    })
    .sort((a, b) => b.active - a.active)
    .slice(0, 4)

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-desc">
            {format(now, "EEEE, d MMMM yyyy")} · {interventionsToday} intervention
            {interventionsToday === 1 ? "" : "s"} scheduled today
          </p>
        </div>
        {isAdmin && perms.canCreate && (
          <CommandDialog
            productsList={products || []}
            usersList={users || []}
            trigger={
              <button className="btn btn-primary" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New command
              </button>
            }
          />
        )}
      </div>

      <div className="grid-main">
        <div className="col-left">
          <CardsSection data={kpi} />

          <div className="row-mid">
            <ChartsSection data={typeCounts} />
            <CadenceCard data={cadence} />
          </div>

          <CommandsTable data={commands || []} products={products || []} users={users || []} isAdmin={isAdmin} perms={perms} query={searchQuery} />
        </div>

        <RightPanel data={{ schedule, ops, load }} />
      </div>
    </>
  )
}
