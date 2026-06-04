"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product } from "@/app/generated/prisma/browser"
import { ProductDialog } from "./ProductDialog"
import { DeleteProductDialog } from "./DeleteProductDialog"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

export interface ProductColumnPermissions {
  canUpdate: boolean
  canDelete: boolean
}

export function buildProductColumns(perms: ProductColumnPermissions): ColumnDef<Product>[] {
  const baseColumns: ColumnDef<Product>[] = [
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
  ]

  // Only render the actions column when the admin can act on at least one row.
  if (!perms.canUpdate && !perms.canDelete) {
    return baseColumns
  }

  return [
    ...baseColumns,
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original

        return (
          <div className="flex items-center gap-2">
            {perms.canUpdate && (
              <ProductDialog
                product={product}
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                }
              />
            )}
            {perms.canDelete && <DeleteProductDialog id={product.id} />}
          </div>
        )
      },
    },
  ]
}
