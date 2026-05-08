import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import type { Permission } from "@/app/generated/prisma/client"

export type AppPermission =
  | "COMMAND_CREATE"
  | "COMMAND_UPDATE"
  | "COMMAND_DELETE"
  | "COMMAND_STATUS_UPDATE"
  | "PRODUCT_CREATE"
  | "PRODUCT_UPDATE"
  | "PRODUCT_DELETE"

export async function requirePermission(
  permission: AppPermission
): Promise<{ ok: true; userId: number } | { ok: false; message: string }> {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return { ok: false, message: "Unauthorized" }
  }

  if (process.env.EMAILADMIN && session.user.email === process.env.EMAILADMIN) {
    return { ok: true, userId: Number(session.user.id) }
  }

  if (session.user.role !== "ADMIN") {
    return { ok: false, message: "Forbidden: Admins only" }
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { permissions: true, approved: true },
  })

  if (!user) {
    return { ok: false, message: "User not found" }
  }

  if (!user.approved) {
    return { ok: false, message: "Forbidden: Account pending approval" }
  }

  if (!user.permissions.includes(permission as Permission)) {
    return { ok: false, message: "Forbidden: Missing permission" }
  }

  return { ok: true, userId: Number(session.user.id) }
}

