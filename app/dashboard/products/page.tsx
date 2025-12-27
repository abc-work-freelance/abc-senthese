import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/products/columns"
import { getAllProducts } from "@/app/actions/products"
import { ProductDialog } from "@/components/products/ProductDialog"

export default async function ProductsPage() {
  const { products } = await getAllProducts()

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product inventory here.
          </p>
        </div>
        <ProductDialog />
      </div>
      <DataTable 
        data={products || []} 
        columns={columns} 
        searchKey="name"
        searchPlaceholder="Filter products..."
      />
    </div>
  )
}
