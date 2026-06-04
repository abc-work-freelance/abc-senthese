"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AuthShell from "@/components/auth/AuthShell"
import { requestPasswordReset } from "@/app/actions/password-reset"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setInfo("")
    setLoading(true)

    try {
      const res = await requestPasswordReset(email)
      if (!res.success) {
        setError(res.message)
        setLoading(false)
        return
      }
      // Only move on to code entry when a code was actually delivered.
      if (res.channel === "whatsapp") {
        router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`)
      } else {
        setInfo(res.message)
        setLoading(false)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <AuthShell variant="reset">
      <div className="fp-inner">
        <div className="fp-head">
          <h1>Forgot password</h1>
          <p>Enter your account email and we&apos;ll send a verification code to reset your password.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="fp-email">Email address</label>
            <div className="inp with-icon">
              <svg className="lic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
              <input
                id="fp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@clinic.com"
                autoComplete="email"
                required
              />
            </div>
            <p className="hint">The code is sent by WhatsApp to the phone number on your account.</p>
          </div>

          {error && (
            <div className="errbox">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
              <p>{error}</p>
            </div>
          )}

          {info && (
            <div className="notice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
              <p>{info} <Link href={`/reset-password?email=${encodeURIComponent(email.trim())}`} className="act">I already have a code</Link></p>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <><span className="spinner" />Sending code…</>
            ) : (
              <>Send reset code<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></>
            )}
          </button>
        </form>

        <div className="divider-text">Remembered it? <Link href="/login" className="act">Back to sign in</Link></div>
      </div>
    </AuthShell>
  )
}
