import { getAllProducts } from "@/app/actions/products"
import { ProductDialog } from "@/components/products/ProductDialog"
import { ProductsTable } from "@/components/products/ProductsTable"
import { getEffectivePermissions } from "@/lib/permissions"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const { products } = await getAllProducts()
  const permissions = await getEffectivePermissions()
  const canCreate = permissions.includes("PRODUCT_CREATE")
  const canUpdate = permissions.includes("PRODUCT_UPDATE")
  const canDelete = permissions.includes("PRODUCT_DELETE")

  return (
    <div className="flex-1 flex-col space-y-6 md:flex">
      <div className="page-head">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-desc">Manage your product inventory here.</p>
        </div>
        {canCreate && <ProductDialog />}
      </div>
      <ProductsTable
        data={products || []}
        canUpdate={canUpdate}
        canDelete={canDelete}
        initialSearch={q}
      />
    </div>
  )
}
