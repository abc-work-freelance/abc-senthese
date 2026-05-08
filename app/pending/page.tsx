import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Clock, Mail } from "lucide-react"
import { LogoutModal } from "@/components/elements/Logout-Modal"

export default async function PendingApprovalPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/")
  }

  const isSuperAdmin =
    !!process.env.EMAILADMIN && session.user.email === process.env.EMAILADMIN

  if (session.user.approved || isSuperAdmin) {
    redirect("/dashboard")
  }

  const adminEmail = process.env.EMAILADMIN

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--med-surface)" }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl border bg-white p-8 shadow-[0_8px_24px_rgba(13,27,46,0.08)]"
          style={{ borderColor: "var(--med-border)" }}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)",
              }}
            >
              <Clock className="h-8 w-8 text-white" />
            </div>

            <h1
              className="mt-6 text-2xl font-semibold"
              style={{
                color: "var(--med-text-primary)",
                fontFamily: "var(--font-dm-serif)",
              }}
            >
              Account awaiting approval
            </h1>

            <p
              className="mt-3 text-sm"
              style={{ color: "var(--med-text-secondary)" }}
            >
              Hi {session.user.name || session.user.email}, your account has
              been created but is waiting for the super admin to approve it.
              Once approved, you&apos;ll be able to access the dashboard.
            </p>

            {adminEmail && (
              <div
                className="mt-6 flex w-full items-center gap-3 rounded-lg border bg-[#F8FAFC] px-4 py-3 text-left"
                style={{ borderColor: "var(--med-border)" }}
              >
                <Mail
                  className="h-4 w-4 shrink-0"
                  style={{ color: "var(--med-text-muted)" }}
                />
                <div className="min-w-0">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: "var(--med-text-muted)" }}
                  >
                    Need help?
                  </div>
                  <div
                    className="truncate text-sm"
                    style={{ color: "var(--med-text-primary)" }}
                  >
                    Contact {adminEmail}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 w-full">
              <LogoutModal>
                <button
                  type="button"
                  className="w-full rounded-md border bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#F8FAFC]"
                  style={{
                    borderColor: "var(--med-border)",
                    color: "#0D1B2E",
                  }}
                >
                  Sign out
                </button>
              </LogoutModal>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
