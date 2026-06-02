"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import "./landing.css"

/* Track the <html data-theme> attribute reactively so the toggle icon
   stays in sync with the theme restored before first paint. */
function subscribeTheme(callback: () => void) {
  const obs = new MutationObserver(callback)
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
  return () => obs.disconnect()
}
function getThemeIsDark() {
  return document.documentElement.getAttribute("data-theme") === "dark"
}

/* Count-up number used in the hero product-preview KPIs. */
function CountUp({ target, duration = 1100 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    // Failsafe: ensure the final value is shown even if rAF is throttled.
    const t = setTimeout(() => setValue(target), 1500)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [target, duration])

  return <span ref={ref}>{value}</span>
}

export default function LandingPage({
  signedIn = false,
}: {
  signedIn?: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isDark = useSyncExternalStore(subscribeTheme, getThemeIsDark, () => false)

  const toggleTheme = () => {
    const root = document.documentElement
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark"
    root.setAttribute("data-theme", next)
    root.classList.toggle("dark", next === "dark")
    try {
      localStorage.setItem("abc-theme", next)
    } catch {}
  }

  const dashboardHref = signedIn ? "/dashboard" : "/login"
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="abc-landing">
      {/* ============ NAV ============ */}
      <nav className="nav">
        <div className="wrap nav-in">
          <a href="#top" className="brand">
            <img src="/assets/abc-logo.png" alt="ABC Synthese" className="brand-logo" />
          </a>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#roles">Roles</a>
            <a href="#workflow">Workflow</a>
            <a href="#range">Prosthetics</a>
          </div>
          <div className="nav-right">
            <button className="tbtn" title="Toggle theme" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>
            <Link href="/login" className="btn btn-ghost">Sign in</Link>
            <Link href={dashboardHref} className="btn btn-primary">Open dashboard</Link>
            <button className="navtoggle" title="Menu" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
        <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#roles" onClick={closeMenu}>Roles</a>
          <a href="#workflow" onClick={closeMenu}>Workflow</a>
          <a href="#range" onClick={closeMenu}>Prosthetics</a>
          <Link href={dashboardHref} onClick={closeMenu}>Open dashboard</Link>
        </div>
      </nav>

      <a id="top" />

      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow"><span className="pip" />Surgical prosthetics operations</span>
            <h1 className="hero-title">Every prosthetics command, <em>from intake to the OR.</em></h1>
            <p className="hero-sub">ABC Synthese is the command center for orthopedic prosthetics teams — track HIP, KNEE and SHOULDER orders, assign instrumentistes, schedule interventions, and close every case with a report. One clear workspace, no spreadsheets.</p>
            <div className="hero-cta">
              <Link href={dashboardHref} className="btn btn-light btn-lg">Open dashboard
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
              <Link href="/register" className="btn btn-ghost btn-lg">Request access</Link>
            </div>
            <div className="hero-meta">
              <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>Role-based access</div>
              <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>Intervention scheduling</div>
              <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></svg>Completion reports</div>
            </div>
          </div>

          <div className="win-wrap">
            <div className="window">
              <div className="win-bar">
                <span className="win-dot" /><span className="win-dot" /><span className="win-dot" />
                <span className="win-url"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>app.abc-synthese.ma/dashboard</span>
              </div>
              <div className="win-body">
                <div className="pv-head">
                  <div className="pv-title">Command intelligence<span>Tuesday · 6 interventions today</span></div>
                  <span className="pv-pill"><span className="ld" />Live</span>
                </div>
                <div className="pv-kpis">
                  <div className="pv-kpi"><div className="l">Active</div><div className="v"><CountUp target={42} /></div></div>
                  <div className="pv-kpi"><div className="l">Today</div><div className="v"><CountUp target={6} /></div></div>
                  <div className="pv-kpi"><div className="l">Complete</div><div className="v"><CountUp target={87} /><small>%</small></div></div>
                </div>
                <div className="pv-rows">
                  <div className="pv-row"><span className="pv-ref">CMD-0148</span><span className="pv-chip chip-hip">HIP</span><span className="pv-doc">Dr. Réda Bennani · Casablanca</span><span className="pv-st st-aff"><span className="sd" />Affectée</span></div>
                  <div className="pv-row"><span className="pv-ref">CMD-0147</span><span className="pv-chip chip-knee">KNEE</span><span className="pv-doc">Dr. Salma Tazi · Marrakech</span><span className="pv-st st-comp"><span className="sd" />Completée</span></div>
                  <div className="pv-row"><span className="pv-ref">CMD-0146</span><span className="pv-chip chip-shoulder">SHLDR</span><span className="pv-doc">Dr. Younes Amrani · Rabat</span><span className="pv-st st-val"><span className="sd" />Validée</span></div>
                  <div className="pv-row"><span className="pv-ref">CMD-0145</span><span className="pv-chip chip-hip">HIP</span><span className="pv-doc">Dr. Imane Cherkaoui · Tanger</span><span className="pv-st st-aff"><span className="sd" />Affectée</span></div>
                </div>
              </div>
            </div>
            <div className="pv-float">
              <span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg></span>
              <span><span className="l">On-time</span><span className="v">27 / 31 cases</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <div className="strip">
        <div className="wrap strip-in">
          <span className="strip-label">Built for the clinical floor</span>
          <div className="strip-items">
            <span className="strip-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></svg>Command tracking</span>
            <span className="strip-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15M21 8l-9 5-9-5 9-5 9 5Z" /><path d="m3 8 9 5 9-5" /></svg>Product catalog</span>
            <span className="strip-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></svg>Instrumentiste roster</span>
            <span className="strip-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>Approvals &amp; permissions</span>
          </div>
        </div>
      </div>

      {/* ============ FEATURES ============ */}
      <section className="sec" id="features">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-eyebrow">What it does</div>
            <h2 className="sec-title">Run the whole prosthetics pipeline in one place.</h2>
            <p className="sec-desc">Replace scattered messages and spreadsheets with a single, structured system that everyone — from admin to instrumentiste — reads the same way.</p>
          </div>
          <div className="bento">
            <article className="feat span2">
              <div className="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></svg></div>
              <h3>Command workflow</h3>
              <p>Capture patient, clinic, doctor, products and delivery date in one structured form — then follow every command through a clear, shared status pipeline.</p>
              <div className="feat-flow">
                <span className="flow-pill on">Validée</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                <span className="flow-pill on">Affectée</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                <span className="flow-pill on">Completée</span>
              </div>
            </article>
            <article className="feat">
              <div className="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" /></svg></div>
              <h3>Intervention scheduling</h3>
              <p>See every intervention on a daily and weekly view and know exactly what&apos;s happening in which clinic, and when.</p>
            </article>
            <article className="feat">
              <div className="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15M21 8l-9 5-9-5 9-5 9 5Z" /><path d="m3 8 9 5 9-5M3 16l9 5 9-5" /></svg></div>
              <h3>Product catalog</h3>
              <p>Maintain the implant catalog once, then attach the exact components each command needs without re-typing references.</p>
            </article>
            <article className="feat">
              <div className="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg></div>
              <h3>Role-aware access</h3>
              <p>Admins manage everything; instrumentistes see only their assigned cases. A super-admin gate controls new accounts.</p>
            </article>
            <article className="feat">
              <div className="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M9 15l2 2 4-4" /></svg></div>
              <h3>Reports &amp; audit trail</h3>
              <p>Close a case with a report file and keep a clean, searchable history — with push notifications on every status change.</p>
            </article>
          </div>
        </div>
      </section>

      {/* ============ ROLES ============ */}
      <section className="roles" id="roles">
        <div className="wrap sec">
          <div className="sec-head center">
            <div className="sec-eyebrow">Who it&apos;s for</div>
            <h2 className="sec-title">One workspace, tailored to every role.</h2>
            <p className="sec-desc">Everyone works from the same source of truth — but only sees what&apos;s theirs to act on.</p>
          </div>
          <div className="role-grid">
            <article className="role">
              <div className="role-top">
                <div className="role-av" style={{ background: "var(--accent)" }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" /><path d="M12 8v8M8 12h8" /></svg></div>
                <div className="role-name">Administrator<span>Runs the operation</span></div>
              </div>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Create &amp; manage every command</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Maintain the product catalog</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Assign instrumentistes to cases</li>
              </ul>
            </article>
            <article className="role">
              <div className="role-top">
                <div className="role-av" style={{ background: "var(--knee)" }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></svg></div>
                <div className="role-name">Instrumentiste<span>On the floor</span></div>
              </div>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>See only assigned interventions</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Review products &amp; case details</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Mark complete &amp; upload reports</li>
              </ul>
            </article>
            <article className="role">
              <div className="role-top">
                <div className="role-av" style={{ background: "var(--shoulder)" }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg></div>
                <div className="role-name">Super-admin<span>Controls access</span></div>
              </div>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Approve or reject new accounts</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Manage roles &amp; permissions</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Oversee the full audit trail</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ============ WORKFLOW ============ */}
      <section className="sec" id="workflow">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-eyebrow">How it works</div>
            <h2 className="sec-title">Designed around how clinical teams actually work.</h2>
          </div>
          <div className="wf-grid">
            <div className="wf-step">
              <div className="wf-node">01</div>
              <h3>Create a command</h3>
              <p>Log the prosthesis type, patient file, clinic, surgeon and required products — with the intervention and delivery dates locked in from the start.</p>
            </div>
            <div className="wf-step">
              <div className="wf-node">02</div>
              <h3>Assign &amp; schedule</h3>
              <p>Affect an instrumentiste, place the intervention on the calendar, and keep the whole team aligned with real-time status and notifications.</p>
            </div>
            <div className="wf-step">
              <div className="wf-node">03</div>
              <h3>Deliver &amp; report</h3>
              <p>Mark the case Completée, upload the completion report, and the command moves into a clean, searchable history for audit and follow-up.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROSTHETICS RANGE ============ */}
      <section className="roles" id="range">
        <div className="wrap sec">
          <div className="sec-head">
            <div className="sec-eyebrow">Coverage</div>
            <h2 className="sec-title">Three prosthesis lines, one consistent record.</h2>
            <p className="sec-desc">Every command is typed and color-coded so the mix is readable at a glance across the dashboard, the table, and every report.</p>
          </div>
          <div className="range-grid">
            <div className="range-card">
              <div className="range-top range-hip"><svg viewBox="0 0 24 24" fill="none" stroke="var(--hip)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="6" r="3" /><path d="M9.5 8.5 18 17M18 17l-1 4M18 17l4-1" /></svg></div>
              <div className="range-body"><div className="k" style={{ color: "var(--hip)" }}>HIP</div><h4>Hip replacement systems</h4><p>Femoral stems, cups, ceramic heads and dual-mobility components — cemented and press-fit.</p></div>
            </div>
            <div className="range-card">
              <div className="range-top range-knee"><svg viewBox="0 0 24 24" fill="none" stroke="var(--knee)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3" /><path d="M12 8v5M9 13h6l-1.5 7h-3L9 13Z" /></svg></div>
              <div className="range-body"><div className="k" style={{ color: "var(--knee)" }}>KNEE</div><h4>Knee replacement systems</h4><p>Femoral components, tibial plateaus and PE inserts across the full size range.</p></div>
            </div>
            <div className="range-card">
              <div className="range-top range-shoulder"><svg viewBox="0 0 24 24" fill="none" stroke="var(--shoulder)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="15" cy="7" r="3.2" /><path d="M12.7 9.2 5 17M5 17l4 .5M5 17l.5 4" /></svg></div>
              <div className="range-body"><div className="k" style={{ color: "var(--shoulder)" }}>SHOULDER</div><h4>Shoulder replacement systems</h4><p>Anatomic and reversed glenoids with humeral stems for total shoulder cases.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="sec">
        <div className="wrap">
          <div className="cta">
            <div className="cta-l">
              <div className="cta-eyebrow">Get started</div>
              <h2>Bring your prosthetics operation onto one board.</h2>
              <p>Open the dashboard to see commands, interventions and reports working together — or request an account and we&apos;ll set up your clinic&apos;s workspace.</p>
            </div>
            <div className="cta-r">
              <Link href={dashboardHref} className="btn btn-light btn-lg">Open dashboard</Link>
              <Link href="/register" className="btn btn-onnavy btn-lg">Request access</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#top" className="brand"><img src="/assets/abc-logo.png" alt="ABC Synthese" style={{ height: "34px", width: "auto", display: "block" }} /></a>
              <p>The command center for orthopedic prosthetics teams — intake, scheduling, assignment and reporting in one clear workspace.</p>
            </div>
            <div className="footer-col">
              <h5>Product</h5>
              <a href="#features">Features</a>
              <a href="#roles">Roles</a>
              <a href="#workflow">Workflow</a>
              <a href="#range">Prosthetics</a>
            </div>
            <div className="footer-col">
              <h5>Workspace</h5>
              <Link href={dashboardHref}>Dashboard</Link>
              <Link href="/login">Sign in</Link>
              <Link href="/register">Request access</Link>
            </div>
            <div className="footer-col">
              <h5>About</h5>
              <a href="#">Contact</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
          <div className="footer-bot">
            <div className="footer-copy">© 2026 ABC Synthese · Prosthetics command management</div>
            <div className="footer-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>Role-based access · Audit-ready</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
