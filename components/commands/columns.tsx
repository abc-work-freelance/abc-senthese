"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Command, Product, User, CommandStatus } from "@/app/generated/prisma/browser"
import { CommandDialog } from "./CommandDialog"
import { DeleteCommandDialog } from "./DeleteCommandDialog"
import { StatusDialog } from "./StatusDialog"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

// We need to extend the Command type to include potential relations if we fetched them
// For simplicity in the client component, we'll accept 'any' row data but type it properly where possible
// But to make it strict, let's define what we expect
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

export const getColumns = ({ productsList, usersList, isAdmin }: CommandColumnsProps): ColumnDef<CommandWithRelations>[] => [
  {
    accessorKey: "reference",
    header: "Reference",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "dateIntervention",
    header: "Date Intervention",
    cell: ({ row }) => format(new Date(row.getValue("dateIntervention")), "PPP"),
  },
  {
    accessorKey: "ville",
    header: "Ville",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "clinique",
    header: "Clinique",
  },
  {
    accessorKey: "doctorName",
    header: "Doctor",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
            <Badge variant={status === "COMPLETEE" ? "default" : status === "ANNULEE" ? "destructive" : "secondary"}>
                {status}
            </Badge>
        )
    }
  },
  {
    id: "products",
    header: "Products",
    cell: ({ row }) => {
        const products = row.original.commandProducts
        if (!products || products.length === 0) return "-"
        return (
            <div className="flex flex-col text-xs">
                {products.map((cp: any, i: number) => (
                    <span key={i}>{cp.product.name} (x{cp.quantity})</span>
                ))}
            </div>
        )
    }
  },
  {
    id: "instrumentiste",
    header: "Instrumentiste",
    cell: ({ row }) => row.original.instrumentiste?.name || "-"
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const command = row.original

      return (
        <div className="flex items-center gap-2">
            {isAdmin ? (
                <>
                    <CommandDialog 
                        command={command} 
                        productsList={productsList}
                        usersList={usersList}
                        trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        } 
                    />
                    <StatusDialog id={command.id} currentStatus={command.status} />
                    <DeleteCommandDialog id={command.id} />
                </>
            ) : (
                <StatusDialog 
                    id={command.id} 
                    currentStatus={command.status} 
                    allowedStatuses={[CommandStatus.COMPLETEE, CommandStatus.ANNULEE]}
                />
            )}
        </div>
      )
    },
  },
]
