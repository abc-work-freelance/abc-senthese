export interface RightPanelData {
  schedule: { time: string; type: string; doctor: string; meta: string }[]
  ops: {
    awaitingValidation: number
    reportedOnHold: number
    cancelled30d: number
    reportsPending: number
  }
  load: { initials: string; name: string; active: number }[]
}

export default function RightPanel({ data }: { data: RightPanelData }) {
  return (
    <aside className="rail">
      <div className="card card-pad" id="schedule">
        <div className="card-head" style={{ marginBottom: 6 }}>
          <div>
            <div className="eyebrow">Today</div>
            <div className="card-title">Schedule</div>
          </div>
          <span className="chip" style={{ background: "var(--accent-weak)", color: "var(--accent-2)" }}>
            {data.schedule.length}
          </span>
        </div>
        <div>
          {data.schedule.length === 0 && (
            <div className="sched-meta" style={{ padding: "8px 0" }}>
              No interventions scheduled today.
            </div>
          )}
          {data.schedule.map((item, i) => (
            <div className="sched-item" key={i}>
              <span className="sched-time">{item.time}</span>
              <div className="sched-body">
                <div className="sched-top">
                  <span className={`chip ${item.type.toLowerCase()}`}>{item.type}</span>
                  <span className="sched-doc">{item.doctor}</span>
                </div>
                <div className="sched-meta">{item.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad">
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          Operations snapshot
        </div>
        <div className="rail-stat">
          <span className="l">Awaiting validation</span>
          <span className="v num">{data.ops.awaitingValidation}</span>
        </div>
        <div className="rail-stat">
          <span className="l">Reported / on hold</span>
          <span className="v num" style={{ color: "var(--warn)" }}>
            {data.ops.reportedOnHold}
          </span>
        </div>
        <div className="rail-stat">
          <span className="l">Cancelled (30d)</span>
          <span className="v num">{data.ops.cancelled30d}</span>
        </div>
        <div className="rail-stat">
          <span className="l">Reports pending upload</span>
          <span className="v num">{data.ops.reportsPending}</span>
        </div>
      </div>

      <div className="card card-pad">
        <div className="eyebrow" style={{ marginBottom: 4 }}>
          Instrumentiste load
        </div>
        {data.load.length === 0 && (
          <div className="sched-meta" style={{ padding: "8px 0" }}>
            No instrumentistes assigned yet.
          </div>
        )}
        {data.load.map((member, i) => (
          <div className="team-row" key={i}>
            <span className="team-av">{member.initials}</span>
            <span className="team-name">{member.name}</span>
            <span className="team-load">{member.active} active</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
