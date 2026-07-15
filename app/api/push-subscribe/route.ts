import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { endpoint, keys, userAgent } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ? Number(session.user.id) : null

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
        userId,
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
        userId,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Push subscribe error", error)
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 })
  }
}
