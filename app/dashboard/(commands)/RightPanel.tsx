import { Card } from "@/components/ui/card"
import { format } from "date-fns"
import { Clock3, MapPin } from "lucide-react"

type PanelCommand = {
  id: number
  reference: string
  status: string
  ville?: string | null
  dateIntervention: string | Date
  updatedAt: string | Date
}

type PanelUser = {
  id: number
  name?: string | null
  familyName?: string | null
}

type RightPanelProps = {
  commands: PanelCommand[]
  users: PanelUser[]
}

function statusTone(status: string) {
  switch (status) {
    case "COMPLETEE":
      return { background: "#ECFDF5", color: "#10B981" }
    case "AFFECTEE":
      return { background: "#EFF6FF", color: "#3B82F6" }
    case "REPORTEE":
      return { background: "#FFF7ED", color: "#F59E0B" }
    case "ANNULEE":
      return { background: "#FEF2F2", color: "#EF4444" }
    default:
      return { background: "#F8FAFC", color: "#94A3B8" }
  }
}

export default function RightPanel({ commands, users }: RightPanelProps) {
  const upcoming = [...commands]
    .filter((command) => command.dateIntervention)
    .sort((left, right) => new Date(left.dateIntervention).getTime() - new Date(right.dateIntervention).getTime())
    .slice(0, 4)

  const activity = [...commands]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 4)

  return (
    <aside className="space-y-4 rounded-2xl border border-[#E8ECF0] bg-white p-6 shadow-[0_18px_40px_rgba(13,27,46,0.05)]" style={{ borderLeftWidth: '1px' }}>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">Upcoming Interventions</div>
            <h3 className="mt-1 text-[20px] font-semibold text-[#1A2332]">Next scheduled cases</h3>
          </div>
          <span className="h-4 w-4" />
        </div>

        <div className="space-y-3">
          {upcoming.map((command) => {
            const tone = statusTone(command.status)
            return (
              <div key={command.id} className="rounded-xl border border-[#E8ECF0] bg-[#F8FAFC] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#1A2332]">{command.reference}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#64748B]">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{command.ville || '—'}</span>
                    </div>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ backgroundColor: tone.background, color: tone.color }}>
                    {format(new Date(command.dateIntervention), 'dd MMM')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-3 border-t border-[#E8ECF0] pt-4">
        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">Instrumentiste Team</div>
        <div className="space-y-2">
          {users.slice(0, 4).map((user, index) => {
            const states = ["online", "busy", "offline", "online"]
            const state = states[index % states.length]
            const tone = state === "online" ? '#10B981' : state === 'busy' ? '#F59E0B' : '#94A3B8'
            const initials = `${user.name?.[0] ?? ''}${user.familyName?.[0] ?? ''}`.toUpperCase() || 'ON'

            return (
              <div key={user.id} className="flex items-center gap-3 rounded-xl border border-[#E8ECF0] bg-[#F8FAFC] p-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xs font-semibold text-white" style={{ backgroundImage: 'linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)' }}>
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-[#1A2332]">{user.name} {user.familyName}</div>
                  <div className="text-xs text-[#94A3B8]">{Math.max(1, 8 - index)} active commands</div>
                </div>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tone }} />
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-3 border-t border-[#E8ECF0] pt-4">
        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">Recent Activity</div>
        <div className="space-y-4">
          {activity.map((command, index) => {
            const tone = statusTone(command.status)
            return (
              <div key={command.id} className="relative flex gap-3 pl-2">
                <div className="relative flex flex-col items-center">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tone.color }} />
                  {index !== activity.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-[#E8ECF0]" />}
                </div>
                <div className="flex-1 pb-2">
                  <div className="text-sm font-medium text-[#1A2332]">
                    {command.reference} moved to {command.status.toLowerCase()}
                  </div>
                  <div className="mt-1 text-xs text-[#94A3B8]">
                    <Clock3 className="mr-1 inline h-3.5 w-3.5" />
                    {format(new Date(command.updatedAt), 'dd MMM, HH:mm')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </aside>
  )
}