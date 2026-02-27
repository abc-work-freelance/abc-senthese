import { StatCard } from '@/components/commands/StatsCards'
import { Boxes, Check, CheckCheck, Send } from 'lucide-react';
import React from 'react'

export interface CardStats {
  total: number;
  completee: number;
  validee: number;
  affectee: number;
}
export default function CardsSection({data}: {data: CardStats}) {
  return (
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Commands"
          value={data.total}
          change={20.1}
          icon={<Boxes className="w-6 h-6" />}
        />
        <StatCard
          title="Complete"
          value={data.completee}
          change={5.02}
          icon={<CheckCheck className="w-6 h-6" />}
        />
        <StatCard
          title="Valide"
          value={data.validee}
          change={-3.58}
          icon={<Check className="w-6 h-6" />}
        />
        <StatCard
          title="Affectee"
          value={data.affectee}
          change={-3.58}
          icon={<Send className="w-6 h-6" />}
        />
      </div>
  )
}
