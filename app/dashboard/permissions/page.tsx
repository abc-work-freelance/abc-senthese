"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { UserRole, Permission } from "@/app/generated/prisma/client"
import { revalidatePath } from "next/cache"

const ALL_PERMISSIONS: Permission[] = [
  "COMMAND_CREATE",
  "COMMAND_UPDATE",
  "COMMAND_DELETE",
  "COMMAND_STATUS_UPDATE",
  "PRODUCT_CREATE",
  "PRODUCT_UPDATE",
  "PRODUCT_DELETE",
]

async function togglePermission(userId: number, permission: Permission) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email || process.env.EMAILADMIN !== session.user.email) {
    throw new Error("Forbidden")
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { permissions: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const hasPermission = user.permissions.includes(permission)

  await prisma.user.update({
    where: { id: userId },
    data: {
      permissions: hasPermission
        ? user.permissions.filter((p) => p !== permission)
        : [...user.permissions, permission],
    },
  })

  revalidatePath("/dashboard/permissions")
}

export default async function PermissionsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email || process.env.EMAILADMIN !== session.user.email) {
    redirect("/dashboard")
  }

  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
    orderBy: { id: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Permissions</h1>
        <p className="text-muted-foreground">
          Manage permissions for admin users. Only the super admin ({process.env.EMAILADMIN}) can access this page.
        </p>
      </div>

      <div className="space-y-4">
        {admins.map((admin) => (
          <div key={admin.id} className="rounded-md border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {admin.name} {admin.familyName}
                </p>
                <p className="text-sm text-muted-foreground">{admin.email}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {ALL_PERMISSIONS.map((perm) => {
                const isChecked = admin.permissions.includes(perm)
                return (
                  <form
                    key={perm}
                    action={async () => {
                      "use server"
                      await togglePermission(admin.id, perm)
                    }}
                  >
                    <button
                      type="submit"
                      className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm ${
                        isChecked ? "bg-primary text-primary-foreground" : "bg-background"
                      }`}
                    >
                      <span>{perm}</span>
                      <span className="ml-2 text-xs">{isChecked ? "On" : "Off"}</span>
                    </button>
                  </form>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

