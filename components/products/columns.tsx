"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product } from "@/app/generated/prisma/browser"
import { ProductDialog } from "./ProductDialog"
import { DeleteProductDialog } from "./DeleteProductDialog"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original

      return (
        <div className="flex items-center gap-2">
          <ProductDialog 
            product={product} 
            trigger={
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
            } 
          />
          <DeleteProductDialog id={product.id} />
        </div>
      )
    },
  },
]
