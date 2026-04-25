'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  delay?: number
  accent: string
  iconBackground: string
  iconColor: string
  progress: number
}

export function StatCard({
  title,
  value,
  change,
  icon,
  accent,
  iconBackground,
  iconColor,
  progress,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  const targetValue = typeof value === 'number' ? value : Number(value) || 0

  useEffect(() => {
    let frame = 0
    const startTime = performance.now()
    const duration = 900

    const step = (time: number) => {
      const elapsed = time - startTime
      const nextValue = Math.min(elapsed / duration, 1)
      setDisplayValue(Math.round(targetValue * nextValue))

      if (nextValue < 1) {
        frame = requestAnimationFrame(step)
      }
    }

    frame = requestAnimationFrame(step)

    return () => cancelAnimationFrame(frame)
  }, [targetValue])

  const isPositive = change >= 0

  return (
    <Card
      className="group relative overflow-hidden border-[#E8ECF0] bg-white p-5 shadow-none transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]"
      style={{ borderRadius: '14px' }}
    >
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundImage: accent }} />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            {title}
          </div>
          <div className="mt-2 text-[28px] font-semibold leading-none text-[#1A2332]">
            {displayValue.toLocaleString()}
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm font-medium">
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-[#10B981]" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-[#EF4444]" />
            )}
            <span style={{ color: isPositive ? '#10B981' : '#EF4444' }}>
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-[#94A3B8]">from last month</span>
          </div>
        </div>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconBackground, color: iconColor }}
        >
          {icon}
        </div>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#EEF2F6]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(Math.max(progress, 8), 100)}%`,
            backgroundImage: accent,
          }}
        />
      </div>
    </Card>
  )
}
