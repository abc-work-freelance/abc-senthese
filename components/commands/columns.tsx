"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Command, Product, User, CommandStatus, ProthesisType } from "@/app/generated/prisma/browser"
import { CommandDialog } from "./CommandDialog"
import { DeleteCommandDialog } from "./DeleteCommandDialog"
import { StatusDialog } from "./StatusDialog"
import { UploadReportDialog } from "./UploadReportDialog"
import { Button } from "@/components/ui/button"
import { SquarePen, Activity, Link2 } from "lucide-react"
import { format } from "date-fns"

type CommandWithRelations = Command & {
    commandProducts: {
        product: Product
        quantity: number
    }[]
    instrumentiste?: {
        name: string | null
        familyName: string | null
    } | null
}

interface CommandColumnsProps {
    productsList: Product[]
    usersList: User[]
    isAdmin: boolean
}

const typeStyles: Record<ProthesisType, { backgroundColor: string; color: string }> = {
  HIP: { backgroundColor: '#EBF9F5', color: '#065F46' },
  KNEE: { backgroundColor: '#EBF5FF', color: '#1D4ED8' },
  SHOULDER: { backgroundColor: '#F3EEFF', color: '#5B21B6' },
}

const statusStyles: Record<CommandStatus, string> = {
  VALIDEE: '#94A3B8',
  AFFECTEE: '#3B82F6',
  COMPLETEE: '#10B981',
  REPORTEE: '#F59E0B',
  ANNULEE: '#EF4444',
}

export const getColumns = ({ productsList, usersList, isAdmin }: CommandColumnsProps): ColumnDef<CommandWithRelations>[] => [
  {
    accessorKey: "reference",
    header: () => <span>Reference</span>,
    cell: ({ row }) => {
      const command = row.original
      return (
        <div className="space-y-1.5">
          <div className="text-[13px] font-medium text-[#1A2332]">{command.reference}</div>
          <div className="text-[11px] text-[#94A3B8]">
            {command.doctorName || 'No doctor'}
            {command.clinique ? ` · ${command.clinique}` : ''}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: () => <span>Type</span>,
    cell: ({ row }) => {
      const type = row.getValue("type") as ProthesisType
      const style = typeStyles[type]

      return (
        <span
          className="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]"
          style={style}
        >
          {type}
        </span>
      )
    },
  },
  {
    accessorKey: "dateIntervention",
    header: () => <span>Date intervention</span>,
    cell: ({ row }) => (
      <span className="text-[13px] text-[#1A2332]">
        {format(new Date(row.getValue("dateIntervention")), "PPP")}
      </span>
    ),
  },
  {
    accessorKey: "ville",
    header: () => <span>City</span>,
  },
  {
    accessorKey: "address",
    header: () => <span>Address</span>,
  },
  {
    accessorKey: "clinique",
    header: () => <span>Clinic</span>,
  },
  {
    accessorKey: "doctorName",
    header: () => <span>Doctor</span>,
  },
  {
    accessorKey: "status",
    header: () => <span>Status</span>,
    cell: ({ row }) => {
        const status = row.getValue("status") as CommandStatus
        return (
            <div className="flex items-center gap-2 text-[13px] font-medium" style={{ color: statusStyles[status] ?? '#94A3B8' }}>
              <span className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: statusStyles[status] ?? '#94A3B8' }} />
              <span>{status}</span>
            </div>
        )
    }
  },
  {
    id: "products",
    header: () => <span>Products</span>,
    cell: ({ row }) => {
        const products = row.original.commandProducts
        if (!products || products.length === 0) return "-"
        return (
            <div className="flex flex-col gap-1 text-xs text-[#1A2332]">
                {products.map((cp, i: number) => (
                    <span key={i}>{cp.product.name} <span className="text-[#94A3B8]">(x{cp.quantity})</span></span>
                ))}
            </div>
        )
    }
  },
  {
    id: "instrumentiste",
    header: () => <span>Instrumentiste</span>,
    cell: ({ row }) => (
      <span className="text-[13px] text-[#1A2332]">
        {row.original.instrumentiste?.name || "-"}
      </span>
    )
  },
  {
    accessorKey: "completionReport",
    header: () => <span>Report</span>,
    cell: ({ row }) => {
      const reportUrl = row.getValue("completionReport") as string | null

      if (!reportUrl) {
        return <span className="text-xs text-[#94A3B8]">No file</span>
      }

      return (
        <a
          href={reportUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0EA5E9] hover:underline"
        >
          <Link2 className="h-3.5 w-3.5" />
          View file
        </a>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const command = row.original

      return (
        <div className="flex items-center gap-1.5">
            {isAdmin ? (
                <>
                    <CommandDialog 
                        command={command} 
                        productsList={productsList}
                        usersList={usersList}
                        trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-[#0D7B5F] transition-colors hover:bg-[#EBF9F5] hover:text-[#0D7B5F]">
                            <SquarePen className="h-4 w-4" />
                        </Button>
                        } 
                    />
                    <StatusDialog id={command.id} currentStatus={command.status} trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-[#0D7B5F] transition-colors hover:bg-[#EBF9F5] hover:text-[#0D7B5F]">
                        <Activity className="h-4 w-4" />
                      </Button>
                    } />
                    <DeleteCommandDialog id={command.id} />
                </>
            ) : (
                <>
                  <StatusDialog 
                      id={command.id} 
                      currentStatus={command.status} 
                      allowedStatuses={[
                        CommandStatus.AFFECTEE,
                        CommandStatus.REPORTEE,
                        CommandStatus.COMPLETEE,
                        CommandStatus.ANNULEE,
                      ]}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-[#0D7B5F] transition-colors hover:bg-[#EBF9F5] hover:text-[#0D7B5F]">
                          <Activity className="h-4 w-4" />
                        </Button>
                      }
                  />
                  {command.status === CommandStatus.COMPLETEE && (
                    <UploadReportDialog
                      id={command.id}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-[#0D7B5F] transition-colors hover:bg-[#EBF9F5] hover:text-[#0D7B5F]">
                          <Link2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  )}
                </>
            )}
        </div>
      )
    },
  },
]
