"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { compare, hash } from "bcryptjs"
import { revalidatePath } from "next/cache"

type ActionResult = {
  success: boolean
  message: string
}

function getSessionUserId(sessionUserId?: string) {
  if (!sessionUserId) return null
  const parsed = Number.parseInt(sessionUserId, 10)
  return Number.isNaN(parsed) ? null : parsed
}

export async function updateProfileName(name: string): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions)
    const userId = getSessionUserId(session?.user?.id)

    if (!userId) {
      return { success: false, message: "Unauthorized" }
    }

    const nextName = name.trim()
    if (nextName.length < 2) {
      return { success: false, message: "Name must contain at least 2 characters." }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { name: nextName },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/settings")

    return {
      success: true,
      message: "Name updated successfully. Sign out and sign back in to refresh the header name.",
    }
  } catch (error) {
    console.error("Update profile name error:", error)
    return { success: false, message: "Failed to update your name." }
  }
}

export async function updateProfilePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions)
    const userId = getSessionUserId(session?.user?.id)

    if (!userId) {
      return { success: false, message: "Unauthorized" }
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, message: "All password fields are required." }
    }

    if (newPassword.length < 8) {
      return { success: false, message: "New password must contain at least 8 characters." }
    }

    if (newPassword !== confirmPassword) {
      return { success: false, message: "Password confirmation does not match." }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    if (!user) {
      return { success: false, message: "User not found." }
    }

    const isCurrentValid = await compare(currentPassword, user.password)
    if (!isCurrentValid) {
      return { success: false, message: "Current password is incorrect." }
    }

    const hashedPassword = await hash(newPassword, 12)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    revalidatePath("/dashboard/settings")

    return { success: true, message: "Password changed successfully." }
  } catch (error) {
    console.error("Update profile password error:", error)
    return { success: false, message: "Failed to update your password." }
  }
}
