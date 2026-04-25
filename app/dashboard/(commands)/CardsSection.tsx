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
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Commands"
          value={data.total}
          change={20.1}
          icon={<Boxes className="w-6 h-6" />}
          accent="linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)"
          iconBackground="#E8FBF5"
          iconColor="#0D7B5F"
          progress={82}
        />
        <StatCard
          title="Complete"
          value={data.completee}
          change={5.02}
          icon={<CheckCheck className="w-6 h-6" />}
          accent="linear-gradient(135deg, #8B5CF6 0%, #C084FC 100%)"
          iconBackground="#F3EEFF"
          iconColor="#7C3AED"
          progress={66}
        />
        <StatCard
          title="Valide"
          value={data.validee}
          change={-3.58}
          icon={<Check className="w-6 h-6" />}
          accent="linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)"
          iconBackground="#FFF6E7"
          iconColor="#D97706"
          progress={48}
        />
        <StatCard
          title="Affectee"
          value={data.affectee}
          change={-3.58}
          icon={<Send className="w-6 h-6" />}
          accent="linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)"
          iconBackground="#FEEEF2"
          iconColor="#E11D48"
          progress={39}
        />
      </div>
  )
}
