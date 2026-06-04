"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import AuthShell from "@/components/auth/AuthShell"
import PasswordInput from "@/components/auth/PasswordInput"
import { resetPassword } from "@/app/actions/password-reset"

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState(searchParams.get("email") ?? "")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await resetPassword(email, code, password)
      if (res.success) {
        router.push("/login?reset=true")
      } else {
        setError(res.message)
        setLoading(false)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="fp-inner">
      <div className="fp-head">
        <h1>Reset password</h1>
        <p>Enter the verification code we sent you and choose a new password.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="rp-email">Email address</label>
          <div className="inp with-icon">
            <svg className="lic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
            <input
              id="rp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@clinic.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="rp-code">Verification code</label>
          <div className="inp with-icon">
            <svg className="lic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <input
              id="rp-code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              autoComplete="one-time-code"
              required
            />
          </div>
          <p className="hint">6-digit code sent by WhatsApp. It expires after 15 minutes.</p>
        </div>

        <div className="field">
          <label htmlFor="rp-pw">New password</label>
          <PasswordInput
            id="rp-pw"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <p className="hint">Must be at least 8 characters long.</p>
        </div>

        {error && (
          <div className="errbox">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
            <p>{error}</p>
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <><span className="spinner" />Updating password…</>
          ) : (
            <>Update password<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></>
          )}
        </button>
      </form>

      <div className="divider-text">Didn&apos;t get a code? <Link href="/forgot-password" className="act">Request a new one</Link></div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <AuthShell variant="reset">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  )
}
