"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export type CreateProductInput = {
  code: string
  name: string
}

export type UpdateProductInput = Partial<CreateProductInput>

export async function createProduct(data: CreateProductInput) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    if (session.user.role !== "ADMIN") {
        return { success: false, message: "Forbidden: Admins only" }
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

    revalidatePath("/products")
    return { success: true, product }
  } catch (error) {
    console.error("Create product error:", error)
    return { success: false, message: "Failed to create product" }
  }
}

export async function updateProduct(id: number, data: UpdateProductInput) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    if (session.user.role !== "ADMIN") {
        return { success: false, message: "Forbidden: Admins only" }
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    })

    revalidatePath(`/products/${id}`)
    revalidatePath("/products")
    return { success: true, product }
  } catch (error) {
    console.error("Update product error:", error)
    return { success: false, message: "Failed to update product" }
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
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    if (session.user.role !== "ADMIN") {
        return { success: false, message: "Forbidden: Admins only" }
    }

    await prisma.product.delete({
      where: { id },
    })

    revalidatePath("/products")
    return { success: true, message: "Product deleted successfully" }
  } catch (error) {
    console.error("Delete product error:", error)
    return { success: false, message: "Failed to delete product" }
  }
}
