import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import AuthShell from "@/components/auth/AuthShell"
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
  const firstName = (session.user.name || session.user.email || "").split(" ")[0]

  return (
    <AuthShell variant="pending">
      <div className="pending">
        <div className="pending-ic">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        </div>
        <h1>Account awaiting approval</h1>
        <p>
          Hi {firstName}, your account has been created and is waiting for the super-admin to approve it.
          You&apos;ll get access to the dashboard as soon as it&apos;s approved.
        </p>

        <div className="pending-steps">
          <div className="pstep done">
            <span className="dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><path d="M20 6 9 17l-5-5" /></svg></span>
            <div><div className="pt">Account created</div><div className="pd">Your registration was received.</div></div>
          </div>
          <div className="pstep now">
            <span className="dot">2</span>
            <div><div className="pt">Awaiting super-admin approval</div><div className="pd">A super-admin is reviewing your request.</div></div>
          </div>
          <div className="pstep todo">
            <span className="dot">3</span>
            <div><div className="pt">Dashboard access granted</div><div className="pd">You&apos;ll be able to sign in and start working.</div></div>
          </div>
        </div>

        {adminEmail && (
          <div className="contact-card">
            <span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg></span>
            <div><div className="l">Need help?</div><div className="v">Contact {adminEmail}</div></div>
          </div>
        )}

        <LogoutModal>
          <button type="button" className="btn-ghost">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></svg>
            Sign out
          </button>
        </LogoutModal>
      </div>
    </AuthShell>
  )
}
