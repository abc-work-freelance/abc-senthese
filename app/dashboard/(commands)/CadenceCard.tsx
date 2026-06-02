export interface CadenceData {
  days: { label: string; value: number }[]
  todayIndex: number
  scheduled: number
  today: number
  dailyAvg: string
}

export default function CadenceCard({ data }: { data: CadenceData }) {
  const max = Math.max(1, ...data.days.map((d) => d.value))

  return (
    <div className="card card-pad">
      <div className="card-head">
        <div>
          <div className="eyebrow">This week</div>
          <div className="card-title">Intervention cadence</div>
        </div>
      </div>
      <div className="cadence">
        {data.days.map((day, i) => {
          // Scale to the busiest day, keeping a small floor so empty days still read.
          const height = day.value === 0 ? 6 : Math.round((day.value / max) * 92) + 8
          const future = i > data.todayIndex
          return (
            <div className="cad-col" key={day.label + i}>
              <div className={`cad-bar${future ? " dim" : ""}`} style={{ height: `${height}%` }} title={`${day.value}`} />
              <div className={`cad-day${i === data.todayIndex ? " today" : ""}`}>{day.label}</div>
            </div>
          )
        })}
      </div>
      <div className="cadence-foot">
        <div className="cf">
          <span className="n num">{data.scheduled}</span>
          <span className="l">Scheduled</span>
        </div>
        <div className="cf">
          <span className="n num">{data.today}</span>
          <span className="l">Today</span>
        </div>
        <div className="cf">
          <span className="n num">{data.dailyAvg}</span>
          <span className="l">Daily avg</span>
        </div>
      </div>
    </div>
  )
}
