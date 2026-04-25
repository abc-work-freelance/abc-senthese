"use client"

import { Card } from "@/components/ui/card"
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

type ChartsSectionProps = {
  data: {
    hip: number
    knee: number
    shoulder: number
  }
}

const chartColors = ["#00C49A", "#0EA5E9", "#8B5CF6"]

export function ChartsSection({ data }: ChartsSectionProps) {
  const total = Math.max(data.hip + data.knee + data.shoulder, 1)

  const chartData = {
    labels: ["HIP", "KNEE", "SHOULDER"],
    datasets: [
      {
        data: [data.hip, data.knee, data.shoulder],
        backgroundColor: chartColors,
        borderColor: ["#FFFFFF", "#FFFFFF", "#FFFFFF"],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }

  return (
    <Card className="border-[#E8ECF0] bg-white p-5 shadow-none" style={{ borderRadius: "14px" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            Prosthesis mix
          </div>
          <h3 className="mt-1 text-[20px] font-semibold text-[#1A2332]">
            Distribution by type
          </h3>
          <p className="mt-1 text-sm text-[#94A3B8]">
            {total} commands across the active prosthetics catalog.
          </p>
        </div>
        <div className="rounded-full border border-[#E8ECF0] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
          HIP / KNEE / SHOULDER
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
        <div className="mx-auto w-full max-w-[220px]">
          <Doughnut
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              cutout: "72%",
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: "#0D1B2E",
                  padding: 12,
                  titleColor: "#FFFFFF",
                  bodyColor: "#FFFFFF",
                },
              },
            }}
          />
        </div>

        <div className="space-y-3">
          {[
            { label: "HIP", value: data.hip, color: chartColors[0], background: "#EBF9F5" },
            { label: "KNEE", value: data.knee, color: chartColors[1], background: "#EBF5FF" },
            { label: "SHOULDER", value: data.shoulder, color: chartColors[2], background: "#F3EEFF" },
          ].map((item) => {
            const percentage = Math.round((item.value / total) * 100)

            return (
              <div key={item.label} className="rounded-xl border border-[#E8ECF0] bg-[#F8FAFC] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md" style={{ backgroundColor: item.background, color: item.color }}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-[#1A2332]">{item.label}</div>
                      <div className="text-xs text-[#94A3B8]">{item.value} commands</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold" style={{ color: item.color }}>
                    {percentage}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}