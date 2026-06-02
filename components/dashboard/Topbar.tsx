"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Bell, ChevronRight, Moon, Search, Sun } from "lucide-react"

const ACCENTS = ["teal", "blue", "violet"] as const
type Accent = (typeof ACCENTS)[number]

const CRUMBS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/products": "Products",
  "/dashboard/permissions": "Permissions",
  "/dashboard/approvals": "Approvals",
  "/dashboard/settings": "Settings",
}

function crumbLabel(pathname: string) {
  if (CRUMBS[pathname]) return CRUMBS[pathname]
  const last = pathname.split("/").filter(Boolean).pop() ?? "Dashboard"
  return last.charAt(0).toUpperCase() + last.slice(1)
}

export function Topbar({ leading }: { leading?: React.ReactNode }) {
  const pathname = usePathname()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [accent, setAccent] = useState<Accent>("teal")

  // Sync local state from the attributes the no-flash script already applied
  // (read once after mount to avoid an SSR/client hydration mismatch).
  useEffect(() => {
    const root = document.documentElement
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme((root.getAttribute("data-theme") as "light" | "dark") ?? "light")
    setAccent((root.getAttribute("data-accent") as Accent) ?? "teal")
  }, [])

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark"
    const root = document.documentElement
    root.setAttribute("data-theme", next)
    root.classList.toggle("dark", next === "dark")
    try {
      localStorage.setItem("abc-theme", next)
    } catch {}
    setTheme(next)
  }

  function pickAccent(next: Accent) {
    document.documentElement.setAttribute("data-accent", next)
    try {
      localStorage.setItem("abc-accent", next)
    } catch {}
    setAccent(next)
  }

  return (
    <header className="topbar">
      {leading}
      <div className="crumb">
        Workspace <ChevronRight strokeWidth={2} /> <b>{crumbLabel(pathname)}</b>
      </div>

      <label className="search">
        <Search strokeWidth={2} />
        <input placeholder="Search commands, doctors, clinics…" />
        <kbd>⌘K</kbd>
      </label>

      <div className="top-actions">
        <div className="swatches">
          {ACCENTS.map((c) => (
            <button
              key={c}
              type="button"
              className={`swatch${accent === c ? " on" : ""}`}
              data-c={c}
              title={c.charAt(0).toUpperCase() + c.slice(1)}
              aria-label={`${c} accent`}
              onClick={() => pickAccent(c)}
            />
          ))}
        </div>

        <button className="tbtn" type="button" title="Toggle theme" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun strokeWidth={2} /> : <Moon strokeWidth={2} />}
        </button>

        <button className="tbtn" type="button" title="Notifications" aria-label="Notifications">
          <span className="dot" />
          <Bell strokeWidth={2} />
        </button>
      </div>
    </header>
  )
}
