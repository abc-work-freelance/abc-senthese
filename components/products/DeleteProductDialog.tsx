"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteProduct } from "@/app/actions/products"
import { useToast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"

interface DeleteProductDialogProps {
  id: number
}

export function DeleteProductDialog({ id }: DeleteProductDialogProps) {
  const toast = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    try {
      const result = await deleteProduct(id)
      if (result?.success) {
        toast.success("Product deleted.")
        router.refresh()
      } else {
        toast.error(result?.message || "Failed to delete product.")
      }
    } catch (error) {
      console.error("Failed to delete product", error)
      toast.error("Failed to delete product. Please try again.")
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the product.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
