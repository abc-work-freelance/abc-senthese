"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UserRole, CommandStatus, ProthesisType } from "@/app/generated/prisma/client"
import type { Prisma } from "@/app/generated/prisma/client"

export type SearchResult =
  | {
      kind: "command"
      id: number
      title: string
      subtitle: string
      status: CommandStatus
      href: string
    }
  | {
      kind: "product"
      id: number
      title: string
      subtitle: string
      href: string
    }

const MIN_QUERY_LENGTH = 2

/**
 * Global dashboard search used by the top bar. Results are scoped to what the
 * signed-in user is allowed to see:
 *  - admins search all commands plus products,
 *  - instrumentistes search only the commands assigned to them (and only the
 *    statuses they can see on their dashboard).
 */
export async function searchDashboard(queryRaw: string): Promise<SearchResult[]> {
  const q = (queryRaw ?? "").trim()
  if (q.length < MIN_QUERY_LENGTH) return []

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  const role = session.user.role
  const userId = Number(session.user.id)
  const results: SearchResult[] = []

  // Let a query like "knee" match the prosthesis type enum too.
  const typeMatches = (Object.values(ProthesisType) as ProthesisType[]).filter((t) =>
    t.toLowerCase().includes(q.toLowerCase())
  )

  const or: Prisma.CommandWhereInput[] = [
    { reference: { contains: q, mode: "insensitive" } },
    { doctorName: { contains: q, mode: "insensitive" } },
    { clinique: { contains: q, mode: "insensitive" } },
    { ville: { contains: q, mode: "insensitive" } },
    {
      commandProducts: {
        some: {
          product: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { code: { contains: q, mode: "insensitive" } },
            ],
          },
        },
      },
    },
  ]
  if (typeMatches.length) or.push({ type: { in: typeMatches } })

  const where: Prisma.CommandWhereInput = { OR: or }
  if (role === UserRole.INSTRUMENTISTE) {
    where.instrumentisteId = userId
    where.status = {
      in: [CommandStatus.AFFECTEE, CommandStatus.COMPLETEE, CommandStatus.ANNULEE],
    }
  }

  const commands = await prisma.command.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      reference: true,
      doctorName: true,
      clinique: true,
      ville: true,
      status: true,
      type: true,
    },
  })

  for (const c of commands) {
    const subtitle = [c.type, c.clinique || c.ville, c.doctorName].filter(Boolean).join(" · ")
    results.push({
      kind: "command",
      id: c.id,
      title: c.reference,
      subtitle: subtitle || "Command",
      status: c.status,
      href: `/dashboard?q=${encodeURIComponent(c.reference)}#commands`,
    })
  }

  // Products are an admin-only area.
  if (role === UserRole.ADMIN) {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { code: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { code: "asc" },
      take: 4,
      select: { id: true, code: true, name: true },
    })

    for (const p of products) {
      results.push({
        kind: "product",
        id: p.id,
        title: p.name,
        subtitle: `Product · ${p.code}`,
        href: `/dashboard/products?q=${encodeURIComponent(p.name)}`,
      })
    }
  }

  return results
}
