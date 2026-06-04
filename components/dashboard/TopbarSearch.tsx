"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ClipboardList, Loader2, Package, Search } from "lucide-react"
import { searchDashboard, type SearchResult } from "@/app/actions/search"

const DEBOUNCE_MS = 220
const MIN_QUERY_LENGTH = 2

export function TopbarSearch() {
  const router = useRouter()
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  // Debounced search. A request counter guards against out-of-order responses.
  useEffect(() => {
    const term = query.trim()
    if (term.length < MIN_QUERY_LENGTH) {
      setResults([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    const handle = setTimeout(async () => {
      try {
        const res = await searchDashboard(term)
        if (!cancelled) {
          setResults(res)
          setActiveIndex(res.length > 0 ? 0 : -1)
        }
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [query])

  // ⌘K / Ctrl+K focuses the search from anywhere.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open])

  function go(result: SearchResult) {
    setOpen(false)
    setQuery("")
    setResults([])
    router.push(result.href)
  }

  function submitFreeText() {
    const term = query.trim()
    if (!term) return
    setOpen(false)
    router.push(`/dashboard?q=${encodeURIComponent(term)}#commands`)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
      return
    }
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (event.key === "Enter") {
      event.preventDefault()
      const selected = results[activeIndex]
      if (selected) go(selected)
      else submitFreeText()
    }
  }

  const showDropdown = open && query.trim().length >= MIN_QUERY_LENGTH

  return (
    <div className="search-wrap" ref={wrapRef}>
      <label className="search">
        <Search strokeWidth={2} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search commands, doctors, clinics…"
          aria-label="Search"
          autoComplete="off"
        />
        <kbd>⌘K</kbd>
      </label>

      {showDropdown && (
        <div className="search-results" role="listbox">
          {loading && results.length === 0 ? (
            <div className="search-status">
              <Loader2 className="spin" />
              <span>Searching…</span>
            </div>
          ) : results.length === 0 ? (
            <div className="search-status">No matches for “{query.trim()}”.</div>
          ) : (
            results.map((result, i) => {
              const Icon = result.kind === "command" ? ClipboardList : Package
              return (
                <button
                  key={`${result.kind}-${result.id}`}
                  type="button"
                  role="option"
                  aria-selected={i === activeIndex}
                  className={`search-item${i === activeIndex ? " active" : ""}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => go(result)}
                >
                  <span className="search-item-icon">
                    <Icon />
                  </span>
                  <span className="search-item-body">
                    <span className="search-item-title">{result.title}</span>
                    <span className="search-item-sub">{result.subtitle}</span>
                  </span>
                  <span className="search-item-kind">{result.kind}</span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
