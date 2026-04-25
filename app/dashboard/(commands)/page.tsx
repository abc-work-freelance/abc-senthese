import { getAllCommands } from "@/app/actions/commands"
import { getAllProducts } from "@/app/actions/products"
import { prisma } from "@/lib/prisma"
import { CommandDialog } from "@/components/commands/CommandDialog"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UserRole, CommandStatus } from "@/app/generated/prisma/client"
import { CommandsTable } from "./CommandsTable"
import CardsSection from "./CardsSection"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ChartsSection } from "@/components/commands/ChartsSection"
import RightPanel from "./RightPanel"

type DashboardCommand = {
  id: number
  reference: string
  type: "HIP" | "KNEE" | "SHOULDER"
  status: "VALIDEE" | "AFFECTEE" | "REPORTEE" | "ANNULEE" | "COMPLETEE"
  dateIntervention: Date | string
  updatedAt: Date | string
  ville?: string | null
  doctorName?: string | null
  clinique?: string | null
  instrumentisteId?: number | null
}

export default async function CommandsPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  const userId = session?.user?.id

  let commands: DashboardCommand[] = []
  
  if (role === UserRole.ADMIN) {
     const res = await getAllCommands()
      commands = res.commands as DashboardCommand[]
  } else if (role === UserRole.INSTRUMENTISTE && userId) {
     const res = await getAllCommands()
      commands = (res.commands as DashboardCommand[] | undefined)?.filter(
        (command) =>
          command.instrumentisteId === parseInt(userId) &&
          [CommandStatus.AFFECTEE, CommandStatus.COMPLETEE, CommandStatus.ANNULEE].includes(command.status)
      ) || []
  }

  const { products } = await getAllProducts()
  const users = await prisma.user.findMany({
      where: { role: UserRole.INSTRUMENTISTE }
  })

  const commandsStat = await prisma.command.findMany()
  const panelCommands = (role === UserRole.ADMIN ? commandsStat : commands) as DashboardCommand[]

  const typeCounts = commandsStat.reduce(
    (acc, command) => {
      if (command.type === "HIP") acc.hip += 1
      if (command.type === "KNEE") acc.knee += 1
      if (command.type === "SHOULDER") acc.shoulder += 1
      return acc
    },
    { hip: 0, knee: 0, shoulder: 0 }
  )

  const topCommands = [...commandsStat]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 4)

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-6 min-w-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="text-[26px] font-semibold leading-tight text-[#1A2332]" style={{ fontFamily: 'var(--font-dm-serif)' }}>
              Command intelligence
            </div>
            <p className="max-w-2xl text-[13px] text-[#94A3B8]">
              Monitor surgical prosthetics commands, interventions, and operational status in a refined clinical workspace.
            </p>
          </div>

          {role === UserRole.ADMIN && (
            <CommandDialog
              productsList={products || []}
              usersList={users || []}
              trigger={
                <Button
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)',
                    boxShadow: '0 4px 14px rgba(0,196,154,0.3)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                  }}
                  className="hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,196,154,0.28)]"
                >
                  <Plus className="mr-2 h-4 w-4" /> New Command
                </Button>
              }
            />
          )}
        </div>

        <CardsSection
          data={{
            total: commandsStat.length,
            affectee: commandsStat.filter(x => x.status == "AFFECTEE").length,
            completee: commandsStat.filter(x => x.status == "COMPLETEE").length,
            validee: commandsStat.filter(x => x.status == "VALIDEE").length
          }}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
          <ChartsSection data={typeCounts} />

          <div className="rounded-xl border border-[#E8ECF0] bg-white p-5 shadow-[0_18px_40px_rgba(13,27,46,0.05)]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">Command cadence</div>
            <h3 className="mt-1 text-[20px] font-semibold text-[#1A2332]">Latest updates</h3>
            <div className="mt-4 space-y-3">
              {topCommands.map((command) => (
                <div key={command.id} className="rounded-[12px] border border-[#E8ECF0] bg-[#F8FAFC] p-3">
                  <div className="text-sm font-semibold text-[#1A2332]">{command.reference}</div>
                  <div className="mt-1 text-xs text-[#94A3B8]">
                    {command.doctorName || 'No doctor'}
                    {command.clinique ? ` · ${command.clinique}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id="commands" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-semibold text-[#1A2332]">Commands</h2>
              <p className="text-[13px] text-[#94A3B8]">Review, filter, and update command records.</p>
            </div>
          </div>

          <CommandsTable 
            data={commands || []} 
            products={products || []}
            users={users || []}
            isAdmin={role === UserRole.ADMIN}
          />
        </div>
      </div>

      <RightPanel commands={panelCommands} users={users} />
    </div>
  )
}
