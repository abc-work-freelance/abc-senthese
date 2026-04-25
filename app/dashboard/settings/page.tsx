import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { SettingsForms } from "@/components/settings/SettingsForms"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/")
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold text-[#1A2332]" style={{ fontFamily: "var(--font-dm-serif)" }}>
          Settings
        </h1>
        <p className="text-[13px] text-[#94A3B8]">
          Manage your profile information and account password.
        </p>
      </div>

      <SettingsForms
        initialName={session.user.name || ""}
        email={session.user.email || ""}
      />
    </div>
  )
}
