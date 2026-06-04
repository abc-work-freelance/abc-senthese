import { CalendarDays, CheckCircle2, ClipboardList, Clock } from "lucide-react"

export interface KpiData {
  activeCommands: number
  awaitingAssignment: number
  interventionsToday: number
  next: { time: string; place: string } | null
  dueThisWeek: number
  notScheduled: number
  completionRate: number
  completedCount: number
  monthTotal: number
  monthName: string
}

export default function CardsSection({ data }: { data: KpiData }) {
  return (
    <div className="kpis">
      {/* Active commands */}
      <div className="kpi">
        <div className="kpi-top">
          <span className="kpi-ico tint-accent">
            <ClipboardList strokeWidth={2} />
          </span>
          <span className="kpi-label">Active commands</span>
        </div>
        <div className="kpi-val num">{data.activeCommands}</div>
        <div className="kpi-foot">
          <span className="pill tint-warn">{data.awaitingAssignment}</span> awaiting assignment
        </div>
      </div>

      {/* Interventions today */}
      <div className="kpi">
        <div className="kpi-top">
          <span className="kpi-ico tint-info">
            <CalendarDays strokeWidth={2} />
          </span>
          <span className="kpi-label">Interventions today</span>
        </div>
        <div className="kpi-val num">{data.interventionsToday}</div>
        <div className="kpi-foot">
          {data.next ? (
            <>
              Next <b style={{ color: "var(--text)", fontWeight: 600, margin: "0 1px" }}>{data.next.time}</b> ·{" "}
              {data.next.place}
            </>
          ) : (
            "Nothing scheduled today"
          )}
        </div>
      </div>

      {/* Due this week */}
      <div className="kpi">
        <div className="kpi-top">
          <span className="kpi-ico tint-warn">
            <Clock strokeWidth={2} />
          </span>
          <span className="kpi-label">Due this week</span>
        </div>
        <div className="kpi-val num">{data.dueThisWeek}</div>
        <div className="kpi-foot">
          <span className="pill tint-danger">{data.notScheduled}</span> not yet scheduled
        </div>
      </div>

      {/* Completion rate */}
      <div className="kpi">
        <div className="kpi-top">
          <span className="kpi-ico tint-ok">
            <CheckCircle2 strokeWidth={2} />
          </span>
          <span className="kpi-label">Completion rate</span>
        </div>
        <div className="kpi-val num">
          {data.completionRate}
          <small>%</small>
        </div>
        <div className="kpi-foot">
          <b style={{ color: "var(--text)", fontWeight: 600 }}>{data.completedCount}</b>&nbsp;of {data.monthTotal}{" "}
          completed in {data.monthName}
        </div>
      </div>
    </div>
  )
}
