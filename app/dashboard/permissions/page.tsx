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

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const isSuperAdmin = !!process.env.EMAILADMIN && session.user.email === process.env.EMAILADMIN
  const isAdmin = session.user.role === UserRole.ADMIN

  if (!isSuperAdmin && !isAdmin) {
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

const PERMISSION_LABELS: Record<Permission, string> = {
  COMMAND_CREATE: "Création de commandes",
  COMMAND_UPDATE: "Modification de commandes",
  COMMAND_DELETE: "Suppression de commandes",
  COMMAND_STATUS_UPDATE: "Changement de statut",
  PRODUCT_CREATE: "Ajout de produits",
  PRODUCT_UPDATE: "Modification de produits",
  PRODUCT_DELETE: "Suppression de produits",
}

export default async function PermissionsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    redirect("/login")
  }

  const isSuperAdmin = !!process.env.EMAILADMIN && session.user.email === process.env.EMAILADMIN
  const isAdmin = session.user.role === UserRole.ADMIN

  if (!isSuperAdmin && !isAdmin) {
    redirect("/dashboard")
  }

  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
    orderBy: { id: "asc" },
  })

  const instrumentistes = await prisma.user.findMany({
    where: { role: UserRole.INSTRUMENTISTE },
    orderBy: { id: "asc" },
  })

  return (
    <div className="space-y-8">
      <div className="page-head">
        <div>
          <h1 className="page-title">Permissions & Limitations</h1>
          <p className="page-desc">
            Autoriser ou limiter la création de commandes pour les instrumentistes et gérer les privilèges administrateurs.
          </p>
        </div>
      </div>

      {/* Section 1: Instrumentistes Command Creation Permissions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span>Instrumentistes</span>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-normal">
            {instrumentistes.length}
          </span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Activer ou restreindre la possibilité pour chaque instrumentiste de créer de nouvelles commandes.
        </p>

        {instrumentistes.length === 0 ? (
          <div className="card p-6 text-center text-muted-foreground">
            Aucun instrumentiste enregistré.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instrumentistes.map((inst) => {
              const canCreate = inst.permissions.includes("COMMAND_CREATE")
              return (
                <div key={inst.id} className="card p-5 flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground text-base">
                        {inst.name} {inst.familyName}
                      </p>
                      <p className="text-sm text-muted-foreground">{inst.email}</p>
                      {inst.phone && (
                        <p className="text-xs text-muted-foreground mt-0.5">📞 {inst.phone}</p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        inst.approved
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {inst.approved ? "Approuvé" : "En attente"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <div className="text-xs font-medium text-foreground">
                      Création de commandes :
                    </div>
                    <form
                      action={async () => {
                        "use server"
                        await togglePermission(inst.id, "COMMAND_CREATE")
                      }}
                    >
                      <button
                        type="submit"
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          canCreate
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            : "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${canCreate ? "bg-white" : "bg-destructive"}`} />
                        {canCreate ? "Autorisé (Création activée)" : "Limité (Création bloquée)"}
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Section 2: Admin Fine-grained Permissions */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span>Administrateurs</span>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-normal">
            {admins.length}
          </span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Gérer les autorisations fines pour les comptes administrateurs.
        </p>

        {admins.length === 0 ? (
          <div className="card p-6 text-center text-muted-foreground">
            Aucun administrateur enregistré.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {admins.map((admin) => {
              const isSuper = !!process.env.EMAILADMIN && admin.email === process.env.EMAILADMIN
              return (
                <div key={admin.id} className="card p-5 flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground text-base">
                          {admin.name} {admin.familyName}
                        </p>
                        {isSuper && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                            Super Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                      {admin.phone && (
                        <p className="text-xs text-muted-foreground mt-0.5">📞 {admin.phone}</p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        admin.approved
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {admin.approved ? "Approuvé" : "En attente"}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2.5">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Privilèges administrateur :
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ALL_PERMISSIONS.map((perm) => {
                        const isChecked = admin.permissions.includes(perm)
                        const label = PERMISSION_LABELS[perm] || perm
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
                              className={`w-full flex items-center justify-between gap-2 p-2.5 rounded-lg text-xs font-medium transition-all ${
                                isChecked
                                  ? "bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100/50"
                                  : "bg-destructive/5 border border-destructive/20 text-destructive hover:bg-destructive/10"
                              }`}
                            >
                              <span className="font-semibold">{label}</span>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold shrink-0 transition-all ${
                                  isChecked
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "bg-destructive/20 text-destructive"
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${isChecked ? "bg-white" : "bg-destructive"}`} />
                                {isChecked ? "Autorisé" : "Limité"}
                              </span>
                            </button>
                          </form>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
