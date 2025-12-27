"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, ProductFormValues } from "./schema"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createProduct, updateProduct } from "@/app/actions/products"
import { Product } from "@/app/generated/prisma/browser"
import { Plus, Pencil } from "lucide-react"

interface ProductDialogProps {
  product?: Product
  trigger?: React.ReactNode
}

export function ProductDialog({ product, trigger }: ProductDialogProps) {
  const [open, setOpen] = useState(false)
  const isEditing = !!product

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      code: product?.code || "",
      name: product?.name || "",
    },
  })

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (isEditing && product) {
        await updateProduct(product.id, data)
      } else {
        await createProduct(data)
      }
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Make changes to the product here."
              : "Add a new product to your inventory."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="P001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
