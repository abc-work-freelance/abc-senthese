"use client"

import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "@/components/commands/columns"
import { Product, User } from "@/app/generated/prisma/browser"
import { CommandStatus, ProthesisType } from "@/app/generated/prisma/browser"

type CommandRow = {
  id: number
  reference: string
  type: ProthesisType
  dateIntervention: string | Date
  dateLivraison: string | Date
  lienIntervention?: string | null
  ville?: string | null
  address?: string | null
  clinique?: string | null
  doctorName?: string | null
  status: CommandStatus
  completionReport?: string | null
  modePaiement?: string | null
  commentaire?: string | null
  instrumentisteId?: number | null
  commandProducts: {
    product: Product
    quantity: number
  }[]
  instrumentiste?: {
    name: string | null
    familyName: string | null
  } | null
}

interface CommandsTableProps {
  data: CommandRow[]
  products: Product[]
  users: User[]
  isAdmin: boolean
}

export function CommandsTable({ data, products, users, isAdmin }: CommandsTableProps) {
  const columns = getColumns({
    productsList: products,
    usersList: users,
    isAdmin: isAdmin,
  })
  return (
    <DataTable
      data={data}
      columns={columns}
      searchKey="reference"
      searchPlaceholder="Filter by reference..."
      title="Commands"
      exportFileName="commands"
      exportMapper={(row) => {
        const command = row as CommandRow
        return {
        Reference: command.reference,
        Type: command.type,
        Status: command.status,
        "Date intervention": command.dateIntervention
          ? new Date(command.dateIntervention).toLocaleDateString()
          : "",
        "Date livraison": command.dateLivraison
          ? new Date(command.dateLivraison).toLocaleDateString()
          : "",
        City: command.ville ?? "",
        Address: command.address ?? "",
        Clinic: command.clinique ?? "",
        Doctor: command.doctorName ?? "",
        Instrumentiste: command.instrumentiste
          ? `${command.instrumentiste.name ?? ""} ${command.instrumentiste.familyName ?? ""}`.trim()
          : "",
        "Payment mode": command.modePaiement ?? "",
        Comment: command.commentaire ?? "",
        Products: command.commandProducts
          .map((cp) => `${cp.product.name} (x${cp.quantity})`)
          .join(", "),
        Report: command.completionReport ?? "",
        }
      }}
    />
  )
}
