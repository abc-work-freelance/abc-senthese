import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SettingsForms } from "@/components/settings/SettingsForms"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/")
  }

  const userId = session.user.id ? Number(session.user.id) : null
  const dbUser = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { phone: true } })
    : null

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-desc">Manage your profile information and account password.</p>
        </div>
      </div>

      <SettingsForms
        initialName={session.user.name || ""}
        email={session.user.email || ""}
        initialPhone={dbUser?.phone || ""}
      />
    </div>
  )
}
