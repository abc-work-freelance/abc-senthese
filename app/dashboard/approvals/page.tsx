"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { UserRole } from "@/app/generated/prisma/client"
import { revalidatePath } from "next/cache"
import { Check, ShieldCheck, UserCheck, UserPlus, X } from "lucide-react"

function isSuperAdmin(email?: string | null) {
  return !!process.env.EMAILADMIN && email === process.env.EMAILADMIN
}

function getInitials(name?: string | null, familyName?: string | null) {
  const first = name?.[0]?.toUpperCase() ?? ""
  const last = familyName?.[0]?.toUpperCase() ?? ""
  return (first + last) || "?"
}

async function approveUser(userId: number) {
  const session = await getServerSession(authOptions)
  if (!isSuperAdmin(session?.user?.email)) {
    throw new Error("Forbidden")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { approved: true },
  })

  revalidatePath("/dashboard/approvals")
}

async function rejectUser(userId: number) {
  const session = await getServerSession(authOptions)
  if (!isSuperAdmin(session?.user?.email)) {
    throw new Error("Forbidden")
  }

  await prisma.user.delete({
    where: { id: userId },
  })

  revalidatePath("/dashboard/approvals")
}

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions)

  if (!isSuperAdmin(session?.user?.email)) {
    redirect("/dashboard")
  }

  const pendingUsers = await prisma.user.findMany({
    where: { approved: false },
    orderBy: { id: "asc" },
  })

  const pendingCount = pendingUsers.length

  return (
    <div className="space-y-6">
      {/* Hero / header card */}
      <div
        className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-[0_8px_24px_rgba(13,27,46,0.08)]"
        style={{ borderColor: "var(--med-border)" }}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-20 blur-3xl"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--accent), var(--accent-2))",
          }}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--accent), var(--accent-2))",
              }}
            >
              <UserCheck className="h-6 w-6" />
            </span>
            <div>
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: "var(--med-text-muted)" }}
              >
                Super admin
              </div>
              <h1
                className="mt-1 text-2xl font-semibold leading-tight"
                style={{
                  color: "var(--med-text-primary)",
                  fontFamily: "var(--font-dm-serif)",
                }}
              >
                Account Approvals
              </h1>
              <p
                className="mt-1 max-w-xl text-sm"
                style={{ color: "var(--med-text-secondary)" }}
              >
                New accounts wait here until you approve them. Until approved,
                they cannot see any data on the platform.
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-3 rounded-xl border px-4 py-3"
            style={{
              borderColor: "var(--med-border)",
              backgroundColor: "var(--surface-2)",
            }}
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: "var(--accent-weak)", color: "var(--accent-2)" }}
            >
              <UserPlus className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div
                className="text-2xl font-semibold"
                style={{ color: "var(--med-text-primary)" }}
              >
                {pendingCount}
              </div>
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: "var(--med-text-muted)" }}
              >
                Pending
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List of pending users */}
      {pendingCount === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-card px-6 py-16 text-center shadow-[0_8px_24px_rgba(13,27,46,0.04)]"
          style={{ borderColor: "var(--med-border)" }}
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--accent-weak)", color: "var(--accent-2)" }}
          >
            <ShieldCheck className="h-7 w-7" />
          </span>
          <div>
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--med-text-primary)" }}
            >
              All caught up
            </h2>
            <p
              className="mt-1 max-w-sm text-sm"
              style={{ color: "var(--med-text-secondary)" }}
            >
              No accounts are waiting for approval. New sign-ups will appear
              here automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {pendingUsers.map((user) => {
            const isAdmin = user.role === UserRole.ADMIN
            return (
              <div
                key={user.id}
                className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-[0_8px_24px_rgba(13,27,46,0.06)] transition-shadow hover:shadow-[0_12px_32px_rgba(13,27,46,0.10)]"
                style={{ borderColor: "var(--med-border)" }}
              >
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-1"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, var(--accent), var(--accent-2))",
                  }}
                />

                <div className="flex items-start gap-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, var(--accent), var(--accent-2))",
                    }}
                  >
                    {getInitials(user.name, user.familyName)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="truncate text-base font-semibold"
                        style={{ color: "var(--med-text-primary)" }}
                      >
                        {user.name} {user.familyName}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
                        style={{
                          backgroundColor: isAdmin
                            ? "color-mix(in srgb, var(--info) 14%, transparent)"
                            : "var(--accent-weak)",
                          color: isAdmin ? "var(--info)" : "var(--accent-2)",
                        }}
                      >
                        {isAdmin ? "Admin" : "Instrumentiste"}
                      </span>
                    </div>
                    <p
                      className="mt-0.5 truncate text-sm"
                      style={{ color: "var(--med-text-muted)" }}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>

                <div
                  className="mt-5 flex items-center gap-2 border-t pt-4"
                  style={{ borderColor: "var(--med-border)" }}
                >
                  <form
                    className="flex-1"
                    action={async () => {
                      "use server"
                      await approveUser(user.id)
                    }}
                  >
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, var(--accent), var(--accent-2))",
                      }}
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                  </form>

                  <form
                    className="flex-1"
                    action={async () => {
                      "use server"
                      await rejectUser(user.id)
                    }}
                  >
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-semibold transition-colors hover:opacity-80"
                      style={{
                        borderColor: "color-mix(in srgb, var(--danger) 45%, transparent)",
                        color: "var(--danger)",
                      }}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
