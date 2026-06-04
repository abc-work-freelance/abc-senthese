"use client"

import type { ReactNode } from "react"
import "./auth.css"
import ThemeToggle from "./ThemeToggle"

type Variant = "login" | "register" | "pending" | "reset"

const panelCopy: Record<Variant, { eyebrow: string; title: string; desc: string }> = {
  login: {
    eyebrow: "Prosthetics command management",
    title: "Clinical command, from intake to the OR.",
    desc: "Track HIP, KNEE and SHOULDER orders, assign instrumentistes, schedule interventions, and close every case with a report — in one shared workspace.",
  },
  reset: {
    eyebrow: "Account recovery",
    title: "Back to your workspace in a moment.",
    desc: "We'll send a one-time verification code to the phone number on your account so you can securely set a new password.",
  },
  register: {
    eyebrow: "Join the network",
    title: "One workspace for the whole prosthetics team.",
    desc: "Create an account to manage commands, coordinate interventions, and keep every case auditable from first order to final report.",
  },
  pending: {
    eyebrow: "Almost there",
    title: "Your access is being set up.",
    desc: "Accounts are approved by a super-admin to keep clinical data secure. This usually takes a short while.",
  },
}

export default function AuthShell({
  variant,
  children,
}: {
  variant: Variant
  children: ReactNode
}) {
  const copy = panelCopy[variant]

  return (
    <div className="abc-auth">
      <ThemeToggle />
      <div className="auth">
        {/* ===== LEFT brand panel ===== */}
        <aside className="brandpanel">
          <div className="bp-top">
            <span className="bp-logo">
              <img src="/assets/abc-logo-light.png" alt="ABC Synthese" />
            </span>
          </div>
          <div className="bp-headline">
            <div className="bp-eyebrow">{copy.eyebrow}</div>
            <h2>{copy.title}</h2>
            <p>{copy.desc}</p>
            {variant !== "pending" && (
              <div className="bp-list">
                <div className="bp-item">
                  <span className="ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></svg>
                  </span>
                  <div><h4>Real-time command tracking</h4><p>Follow every order through Validée → Affectée → Completée.</p></div>
                </div>
                <div className="bp-item">
                  <span className="ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
                  </span>
                  <div><h4>Role-based access</h4><p>Everyone sees exactly what&apos;s theirs to act on — nothing more.</p></div>
                </div>
                <div className="bp-item">
                  <span className="ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></svg>
                  </span>
                  <div><h4>Coordinated teams</h4><p>Instrumentistes, admins and clinics aligned on one record.</p></div>
                </div>
              </div>
            )}
          </div>
          <div className="bp-foot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>
            Role-based access · Audit-ready · Push notifications
          </div>
        </aside>

        {/* ===== RIGHT form panel ===== */}
        <main className="formpanel">
          <div className="fp-mobile-logo">
            <img className="l-default" src="/assets/abc-logo.png" alt="ABC Synthese" />
            <img className="l-light" src="/assets/abc-logo-light.png" alt="ABC Synthese" />
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
