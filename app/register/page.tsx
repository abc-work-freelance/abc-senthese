"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AuthShell from "@/components/auth/AuthShell"
import PasswordInput from "@/components/auth/PasswordInput"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    familyName: "",
    email: "",
    phone: "",
    password: "",
    role: "INSTRUMENTISTE",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push("/login?registered=true")
      } else {
        const data = await res.json()
        setError(data.message || "Registration failed")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell variant="register">
      <div className="fp-inner">
        <div className="fp-head">
          <h1>Create account</h1>
          <p>Register to join the ABC Synthese clinical network.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row2">
            <div className="field">
              <label htmlFor="r-first">First name</label>
              <div className="inp">
                <input id="r-first" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="John" autoComplete="given-name" required />
              </div>
            </div>
            <div className="field">
              <label htmlFor="r-last">Family name</label>
              <div className="inp">
                <input id="r-last" name="familyName" type="text" value={formData.familyName} onChange={handleChange} placeholder="Doe" autoComplete="family-name" required />
              </div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="r-email">Email address</label>
            <div className="inp with-icon">
              <svg className="lic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
              <input id="r-email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john.doe@clinic.com" autoComplete="email" required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="r-phone">Phone number</label>
            <div className="inp with-icon">
              <svg className="lic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" /></svg>
              <input id="r-phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+212 6 00 00 00 00" autoComplete="tel" />
            </div>
            <p className="hint">International format (e.g. +212600000000) — used for WhatsApp notifications.</p>
          </div>

          <div className="field">
            <label htmlFor="r-pw">Password</label>
            <PasswordInput
              id="r-pw"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            <p className="hint">Must be at least 8 characters long.</p>
          </div>

          <div className="field">
            <label htmlFor="r-role">Role</label>
            <div className="inp">
              <select id="r-role" name="role" value={formData.role} onChange={handleChange}>
                <option value="INSTRUMENTISTE">Instrumentiste (Clinical staff)</option>
                <option value="ADMIN">Administrator</option>
              </select>
              <svg className="selarrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
            <p className="hint">New accounts require super-admin approval before access is granted.</p>
          </div>

          {error && (
            <div className="errbox">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
              <p>{error}</p>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <><span className="spinner" />Creating account…</>
            ) : (
              <>Create account<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></>
            )}
          </button>
        </form>

        <div className="divider-text">Already have an account? <Link href="/login" className="act">Sign in</Link></div>
      </div>
    </AuthShell>
  )
}
