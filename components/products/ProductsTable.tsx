"use client"

import { DataTable } from "@/components/ui/data-table"
import { buildProductColumns } from "./columns"
import { Product } from "@/app/generated/prisma/browser"

interface ProductsTableProps {
  data: Product[]
  canUpdate: boolean
  canDelete: boolean
  initialSearch?: string
}

// Client wrapper: column definitions reference client components, so they must
// be built on the client. The server page passes permissions + data down.
export function ProductsTable({ data, canUpdate, canDelete, initialSearch }: ProductsTableProps) {
  const columns = buildProductColumns({ canUpdate, canDelete })

  return (
    <DataTable
      data={data}
      columns={columns}
      searchKey="name"
      searchPlaceholder="Filter products..."
      initialSearch={initialSearch}
    />
  )
}
