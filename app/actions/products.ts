"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { requirePermission } from "@/lib/permissions"
import { isUniqueConstraintError, isRecordNotFoundError } from "@/lib/prisma-errors"
import { broadcastEntityChange } from "@/lib/ws-notify"

export type CreateProductInput = {
  code: string
  name: string
}

export type UpdateProductInput = Partial<CreateProductInput>

export async function createProduct(data: CreateProductInput) {
  try {
    const perm = await requirePermission("PRODUCT_CREATE")
    if (!perm.ok) {
      return { success: false, message: perm.message }
    }

    const existingProduct = await prisma.product.findUnique({
      where: { code: data.code }
    })

    if (existingProduct) {
      return { success: false, message: "Product with this code already exists" }
    }

    const product = await prisma.product.create({
      data,
    })

    broadcastEntityChange({
      entity: "product",
      action: "created",
      id: product.id,
    })

    revalidatePath("/products")
    return { success: true, product }
  } catch (error) {
    console.error("Create product error:", error)
    if (isUniqueConstraintError(error, "code")) {
      return { success: false, message: `A product with code "${data.code}" already exists.` }
    }
    return { success: false, message: "Failed to create product. Please try again." }
  }
}

export async function updateProduct(id: number, data: UpdateProductInput) {
  try {
    const perm = await requirePermission("PRODUCT_UPDATE")
    if (!perm.ok) {
      return { success: false, message: perm.message }
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    })

    broadcastEntityChange({
      entity: "product",
      action: "updated",
      id: product.id,
    })

    revalidatePath(`/products/${id}`)
    revalidatePath("/products")
    return { success: true, product }
  } catch (error) {
    console.error("Update product error:", error)
    if (isUniqueConstraintError(error, "code")) {
      return { success: false, message: `A product with code "${data.code}" already exists.` }
    }
    if (isRecordNotFoundError(error)) {
      return { success: false, message: "This product no longer exists. It may have been deleted." }
    }
    return { success: false, message: "Failed to update product. Please try again." }
  }
}

export async function getProduct(id: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return { success: false, message: "Product not found" }
    }

    return { success: true, product }
  } catch (error) {
    console.error("Get product error:", error)
    return { success: false, message: "Failed to fetch product" }
  }
}

export async function getAllProducts() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    const products = await prisma.product.findMany({
      orderBy: { code: "asc" }
    })

    return { success: true, products }
  } catch (error) {
    console.error("Get all products error:", error)
    return { success: false, message: "Failed to fetch products" }
  }
}

export async function deleteProduct(id: number) {
  try {
    const perm = await requirePermission("PRODUCT_DELETE")
    if (!perm.ok) {
      return { success: false, message: perm.message }
    }

    await prisma.product.delete({
      where: { id },
    })

    broadcastEntityChange({
      entity: "product",
      action: "deleted",
      id,
    })

    revalidatePath("/products")
    return { success: true, message: "Product deleted successfully" }
  } catch (error) {
    console.error("Delete product error:", error)
    if (isRecordNotFoundError(error)) {
      return { success: false, message: "This product has already been deleted." }
    }
    return { success: false, message: "Failed to delete product. Please try again." }
  }
}
