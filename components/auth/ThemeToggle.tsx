"use client"

import { useSyncExternalStore } from "react"

/* Reflects the <html data-theme> attribute restored before first paint,
   and toggles it (persisting to localStorage) — same mechanism the
   landing page and dashboard use. */
function subscribeTheme(callback: () => void) {
  const obs = new MutationObserver(callback)
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
  return () => obs.disconnect()
}
function getThemeIsDark() {
  return document.documentElement.getAttribute("data-theme") === "dark"
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribeTheme, getThemeIsDark, () => false)

  const toggle = () => {
    const root = document.documentElement
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark"
    root.setAttribute("data-theme", next)
    root.classList.toggle("dark", next === "dark")
    try {
      localStorage.setItem("abc-theme", next)
    } catch {}
  }

  return (
    <div className="controls">
      <button className="tbtn" title="Toggle theme" onClick={toggle} aria-label="Toggle theme">
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
    </div>
  )
}
