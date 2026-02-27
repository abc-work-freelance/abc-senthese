"use client"

import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "@/components/commands/columns"
import { Product, User } from "@/app/generated/prisma/browser"

interface CommandsTableProps {
  data: any[]
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
    />
  )
}
