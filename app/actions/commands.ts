"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ProthesisType, PaymentMode, CommandStatus } from "@/app/generated/prisma/client"
import { revalidatePath } from "next/cache"
import { requirePermission } from "@/lib/permissions"
import { broadcastEntityChange } from "@/lib/ws-notify"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"

export type CommandProductInput = {
  productId: number
  quantity: number
}

export type CreateCommandInput = {
  reference: string
  type: ProthesisType
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
    const perm = await requirePermission("COMMAND_CREATE")
    if (!perm.ok) {
      return { success: false, message: perm.message }
    }

    const createdById = perm.userId
    const { products, ...commandData } = data

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

    broadcastEntityChange({
      entity: "command",
      action: "created",
      id: command.id,
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

    const perm = await requirePermission("COMMAND_UPDATE")
    if (!perm.ok) {
      return { success: false, message: perm.message }
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

    broadcastEntityChange({
      entity: "command",
      action: "updated",
      id: command.id,
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
    const perm = await requirePermission("COMMAND_DELETE")
    if (!perm.ok) {
      return { success: false, message: perm.message }
    }

    await prisma.command.delete({
      where: { id },
    })

    broadcastEntityChange({
      entity: "command",
      action: "deleted",
      id,
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
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" }
    }

    const userId = Number(session.user.id)
    const role = session.user.role

    if (role === "ADMIN") {
      const perm = await requirePermission("COMMAND_STATUS_UPDATE")
      if (!perm.ok) {
        return { success: false, message: perm.message }
      }
    } else {
      const command = await prisma.command.findUnique({
        where: { id },
        select: { instrumentisteId: true },
      })

      if (!command || command.instrumentisteId !== userId) {
        return { success: false, message: "Forbidden" }
      }
    }

    const command = await prisma.command.update({
      where: { id },
      data: { status },
    })

    broadcastEntityChange({
      entity: "command",
      action: "status_changed",
      id: command.id,
    })

    revalidatePath(`/commands/${id}`)
    revalidatePath("/commands")
    revalidatePath("/dashboard")
    return { success: true, command }
  } catch (error) {
    console.error("Update status error:", error)
    return { success: false, message: "Failed to update status" }
  }
}

export async function uploadCommandCompletionReport(id: number, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" }
    }

    const userId = Number(session.user.id)
    const role = session.user.role

    const command = await prisma.command.findUnique({
      where: { id },
      select: { id: true, status: true, instrumentisteId: true },
    })

    if (!command) {
      return { success: false, message: "Command not found" }
    }

    if (command.status !== CommandStatus.COMPLETEE) {
      return { success: false, message: "File upload is allowed only when command status is COMPLETEE." }
    }

    if (role !== "ADMIN" && command.instrumentisteId !== userId) {
      return { success: false, message: "Forbidden" }
    }

    const file = formData.get("file")
    if (!(file instanceof File)) {
      return { success: false, message: "No file provided." }
    }

    if (file.size === 0) {
      return { success: false, message: "Uploaded file is empty." }
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return { success: false, message: "File is too large. Maximum allowed size is 10MB." }
    }

    const ext = path.extname(file.name || "").toLowerCase()
    const allowedExt = new Set([".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx"])

    if (!allowedExt.has(ext)) {
      return { success: false, message: "Unsupported file type. Allowed: PDF, PNG, JPG, DOC, DOCX." }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const uniqueName = `${id}-${randomUUID()}${ext}`
    const relativePath = `/uploads/commands/${uniqueName}`
    const targetDir = path.join(process.cwd(), "public", "uploads", "commands")
    const targetPath = path.join(targetDir, uniqueName)

    await mkdir(targetDir, { recursive: true })
    await writeFile(targetPath, buffer)

    await prisma.command.update({
      where: { id },
      data: {
        completionReport: relativePath,
        attachments: {
          create: {
            url: relativePath,
            name: file.name,
          },
        },
      },
    })

    broadcastEntityChange({
      entity: "command",
      action: "updated",
      id,
    })

    revalidatePath("/dashboard")
    revalidatePath("/commands")

    return { success: true, message: "File uploaded successfully." }
  } catch (error) {
    console.error("Upload completion report error:", error)
    return { success: false, message: "Failed to upload file." }
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
