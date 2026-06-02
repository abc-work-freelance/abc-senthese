type ChartsSectionProps = {
  data: {
    hip: number
    knee: number
    shoulder: number
  }
}

const SEGMENTS = [
  { key: "hip", label: "Hip", color: "#0E9E84" },
  { key: "knee", label: "Knee", color: "#2B6CD4" },
  { key: "shoulder", label: "Shoulder", color: "#6D5BD0" },
] as const

export function ChartsSection({ data }: ChartsSectionProps) {
  const total = data.hip + data.knee + data.shoulder
  const safeTotal = Math.max(total, 1)

  // Build donut segments using the dash-array technique on a r=15.915 circle
  // (circumference ≈ 100), so each dash length maps directly to a percentage.
  const arcs = SEGMENTS.map((segment, i) => {
    const pct = (data[segment.key] / safeTotal) * 100
    const before = SEGMENTS.slice(0, i).reduce((acc, s) => acc + data[s.key], 0) / safeTotal * 100
    return { color: segment.color, pct, offset: 25 - before }
  })

  return (
    <div className="card card-pad">
      <div className="card-head">
        <div>
          <div className="eyebrow">Prosthesis mix</div>
          <div className="card-title">Distribution by type</div>
        </div>
      </div>
      <div className="donut-wrap">
        <div className="donut">
          <svg viewBox="0 0 42 42" width="152" height="152">
            <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--surface-3)" strokeWidth="5" />
            {arcs.map((arc, i) =>
              arc.pct > 0 ? (
                <circle
                  key={i}
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="5"
                  strokeDasharray={`${arc.pct} ${100 - arc.pct}`}
                  strokeDashoffset={arc.offset}
                  strokeLinecap="round"
                />
              ) : null
            )}
          </svg>
          <div className="donut-center">
            <div>
              <div className="n num">{total}</div>
              <div className="l">Total</div>
            </div>
          </div>
        </div>
        <div className="legend">
          {SEGMENTS.map((segment) => {
            const value = data[segment.key]
            const pct = Math.round((value / safeTotal) * 100)
            return (
              <div className="leg-row" key={segment.key}>
                <span className="leg-dot" style={{ background: segment.color }} />
                <span className="leg-name">{segment.label}</span>
                <span className="leg-bar">
                  <span style={{ width: `${pct}%`, background: segment.color }} />
                </span>
                <span className="leg-val">
                  <b>{value}</b> · {pct}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
