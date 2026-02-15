"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ProthesisType, ProthesisSubType, PaymentMode, CommandStatus } from "@/app/generated/prisma/client"
import { revalidatePath } from "next/cache"

export type CommandProductInput = {
  productId: number
  quantity: number
}

export type CreateCommandInput = {
  reference: string
  type: ProthesisType
  subType: ProthesisSubType
  dateIntervention: Date
  dateLivraison: Date
  lienIntervention?: string
  ville: string
  address?: string
  clinique?: string
  doctorName?: string
  modePaiement: PaymentMode
  commentaire?: string
  instrumentisteId?: number
  products?: CommandProductInput[]
}

export type UpdateCommandInput = Partial<Omit<CreateCommandInput, 'products'>> & {
  products?: CommandProductInput[]
}

export async function createCommand(data: CreateCommandInput) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return { success: false, message: "Unauthorized" }
    }

    const createdById = parseInt(session.user.id)
    const { products, address, clinique, doctorName, ...commandData } = data

    const command = await prisma.command.create({
      data: {
        ...commandData,
        createdById,
        commandProducts: products && products.length > 0 ? {
          create: products.map(p => ({
            productId: p.productId,
            quantity: p.quantity
          }))
        } : undefined
      },
    })

    revalidatePath("/commands")
    return { success: true, command }
  } catch (error) {
    console.error("Create command error:", error)
    return { success: false, message: "Failed to create command" }
  }
}

export async function updateCommand(id: number, data: UpdateCommandInput) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    const { products, address, clinique, doctorName, ...commandData } = data

    const updateData: any = {
      ...commandData,
    }

    if (products) {
      updateData.commandProducts = {
        deleteMany: {},
        create: products.map(p => ({
          productId: p.productId,
          quantity: p.quantity
        }))
      }
    }

    const command = await prisma.command.update({
      where: { id },
      data: updateData,
    })

    revalidatePath(`/commands/${id}`)
    revalidatePath("/commands")
    return { success: true, command }
  } catch (error) {
    console.error("Update command error:", error)
    return { success: false, message: "Failed to update command" }
  }
}

export async function getCommand(id: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    const command = await prisma.command.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true,
            familyName: true,
            email: true
          }
        },
        instrumentiste: {
          select: {
            name: true,
            familyName: true,
            email: true
          }
        },
        attachments: true,
        commandProducts: {
          include: {
            product: true
          }
        }
      }
    })

    if (!command) {
      return { success: false, message: "Command not found" }
    }

    return { success: true, command }
  } catch (error) {
    console.error("Get command error:", error)
    return { success: false, message: "Failed to fetch command" }
  }
}

export async function deleteCommand(id: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    // Optional: Check if user is ADMIN or the creator
    const userRole = session.user.role
    if (userRole !== "ADMIN") {
        return { success: false, message: "Forbidden: Admins only" }
    }

    await prisma.command.delete({
      where: { id },
    })

    revalidatePath("/commands")
    return { success: true, message: "Command deleted successfully" }
  } catch (error) {
    console.error("Delete command error:", error)
    return { success: false, message: "Failed to delete command" }
  }
}

export async function updateCommandStatus(id: number, status: CommandStatus) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    const command = await prisma.command.update({
      where: { id },
      data: { status },
    })

    revalidatePath(`/commands/${id}`)
    revalidatePath("/commands")
    return { success: true, command }
  } catch (error) {
    console.error("Update status error:", error)
    return { success: false, message: "Failed to update status" }
  }
}

export async function getAllCommands() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    const commands = await prisma.command.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            name: true,
            familyName: true,
          }
        },
        instrumentiste: {
            select: {
                name: true,
                familyName: true,
            }
        },
        commandProducts: {
          include: {
            product: true
          }
        }
      }
    })

    return { success: true, commands }
  } catch (error) {
    console.error("Get all commands error:", error)
    return { success: false, message: "Failed to fetch commands" }
  }
}
