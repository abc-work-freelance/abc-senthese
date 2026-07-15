"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Download, ListFilter, MoreVertical, X } from "lucide-react"
import { Product, User, CommandStatus, ProthesisType, PaymentMode } from "@/app/generated/prisma/browser"
import { CommandDialog } from "@/components/commands/CommandDialog"
import { DeleteCommandDialog } from "@/components/commands/DeleteCommandDialog"
import { StatusDialog } from "@/components/commands/StatusDialog"
import { UploadReportDialog } from "@/components/commands/UploadReportDialog"
import { SquarePen, Activity, Link2 } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

type CommandRow = {
  id: number
  reference: string
  type: ProthesisType
  dateIntervention: string | Date
  dateLivraison: string | Date
  lienIntervention?: string | null
  ville?: string | null
  address?: string | null
  clinique?: string | null
  doctorName?: string | null
  status: CommandStatus
  completionReport?: string | null
  modePaiement?: string | null
  commentaire?: string | null
  instrumentisteId?: number | null
  commandProducts: {
    product: Product
    quantity: number
  }[]
  instrumentiste?: {
    name: string | null
    familyName: string | null
  } | null
}

interface CommandPermissions {
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  canStatus: boolean
}

interface CommandsTableProps {
  data: CommandRow[]
  products: Product[]
  users: User[]
  isAdmin: boolean
  perms?: CommandPermissions
  /** Free-text search coming from the top-bar search (?q=...). */
  query?: string
}

// Matches a command against a free-text query across the fields a user is most
// likely to search by (reference, people, places, type and product names).
function commandMatchesQuery(command: CommandRow, q: string): boolean {
  const haystack = [
    command.reference,
    command.type,
    command.ville,
    command.clinique,
    command.doctorName,
    ...command.commandProducts.flatMap((cp) => [cp.product.name, cp.product.code]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return haystack.includes(q)
}

const STATUS_CLASS: Record<CommandStatus, string> = {
  VALIDEE: "st-validee",
  AFFECTEE: "st-affectee",
  COMPLETEE: "st-completee",
  REPORTEE: "st-reportee",
  ANNULEE: "st-annulee",
}

const STATUS_LABEL: Record<CommandStatus, string> = {
  VALIDEE: "Validée",
  AFFECTEE: "Affectée",
  COMPLETEE: "Completée",
  REPORTEE: "Reportée",
  ANNULEE: "Annulée",
}

const SEGMENTS = [
  { key: "ALL", label: "All" },
  { key: "AFFECTEE", label: "Affectée" },
  { key: "REPORTEE", label: "Reportée" },
  { key: "COMPLETEE", label: "Completée" },
] as const

type SegmentKey = (typeof SEGMENTS)[number]["key"]

export function CommandsTable({ data, products, users, isAdmin, perms, query }: CommandsTableProps) {
  const router = useRouter()
  const [segment, setSegment] = useState<SegmentKey>("ALL")
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterType, setFilterType] = useState<"ALL" | ProthesisType>("ALL")
  const [filterPayment, setFilterPayment] = useState<"ALL" | string>("ALL")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")
  const canUpdate = perms?.canUpdate ?? false
  const canDelete = perms?.canDelete ?? false
  const canStatus = perms?.canStatus ?? false

  const trimmedQuery = query?.trim().toLowerCase() ?? ""

  const activeFilters =
    (filterType !== "ALL" ? 1 : 0) +
    (filterPayment !== "ALL" ? 1 : 0) +
    (filterDateFrom ? 1 : 0) +
    (filterDateTo ? 1 : 0)

  // Start with free-text search or segment filter
  let rows = trimmedQuery
    ? data.filter((row) => commandMatchesQuery(row, trimmedQuery))
    : segment === "ALL"
      ? data
      : data.filter((row) => row.status === segment)

  // Stack advanced filters on top
  if (filterType !== "ALL") {
    rows = rows.filter((row) => row.type === filterType)
  }
  if (filterPayment !== "ALL") {
    rows = rows.filter((row) => row.modePaiement === filterPayment)
  }
  if (filterDateFrom) {
    const from = new Date(filterDateFrom).getTime()
    rows = rows.filter((row) => new Date(row.dateIntervention).getTime() >= from)
  }
  if (filterDateTo) {
    const to = new Date(filterDateTo).setHours(23, 59, 59, 999)
    rows = rows.filter((row) => new Date(row.dateIntervention).getTime() <= to)
  }

  const resetFilters = () => {
    setFilterType("ALL")
    setFilterPayment("ALL")
    setFilterDateFrom("")
    setFilterDateTo("")
  }

  const handleExport = async () => {
    const XLSX = await import("xlsx")
    const exportRows = rows.map((command) => ({
      Reference: command.reference,
      Type: command.type,
      Status: command.status,
      "Date intervention": command.dateIntervention
        ? new Date(command.dateIntervention).toLocaleString()
        : "",
      City: command.ville ?? "",
      Clinic: command.clinique ?? "",
      Doctor: command.doctorName ?? "",
      Instrumentiste: command.instrumentiste
        ? `${command.instrumentiste.name ?? ""} ${command.instrumentiste.familyName ?? ""}`.trim()
        : "",
      Products: command.commandProducts.map((cp) => `${cp.product.name} (x${cp.quantity})`).join(", "),
      Report: command.completionReport ?? "",
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Commands")
    XLSX.writeFile(workbook, "commands.xlsx")
  }

  return (
    <div className="card table-card" id="commands">
      <div className="table-head">
        <div className="eyebrow" style={{ fontSize: 11 }}>
          Commands
        </div>
        {!trimmedQuery && (
          <div className="seg" style={{ marginLeft: 6 }}>
            {SEGMENTS.map((s) => (
              <button key={s.key} className={segment === s.key ? "on" : ""} onClick={() => setSegment(s.key)} type="button">
                {s.label}
              </button>
            ))}
          </div>
        )}
        {trimmedQuery && (
          <button
            className="search-chip"
            type="button"
            style={{ marginLeft: 6 }}
            onClick={() => router.push("/dashboard#commands")}
            title="Clear search"
          >
            <span>Results for “{query?.trim()}”</span>
            <X />
          </button>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <button className="filter-chip" type="button">
                <ListFilter />
                Filter
                {activeFilters > 0 && <span className="filter-badge">{activeFilters}</span>}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="filter-panel">
              <div className="filter-panel-header">
                <span className="filter-panel-title">Filters</span>
                {activeFilters > 0 && (
                  <button className="filter-reset-btn" type="button" onClick={resetFilters}>
                    <X /> Reset
                  </button>
                )}
              </div>
              <div className="filter-panel-body">
                <label className="filter-label">
                  <span>Type</span>
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
                    <option value="ALL">All</option>
                    {Object.values(ProthesisType).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="filter-label">
                  <span>Payment</span>
                  <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}>
                    <option value="ALL">All</option>
                    {Object.values(PaymentMode).map((m) => (
                      <option key={m} value={m}>{m.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </label>
                <label className="filter-label">
                  <span>Date from</span>
                  <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
                </label>
                <label className="filter-label">
                  <span>Date to</span>
                  <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
                </label>
              </div>
            </PopoverContent>
          </Popover>
          <button className="filter-chip" type="button" onClick={handleExport} disabled={rows.length === 0}>
            <Download />
            Export
          </button>
        </div>
      </div>

      <div className="cmd-table" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Type</th>
              <th>Intervention</th>
              <th>Clinic</th>
              <th>Status</th>
              <th>Instrumentiste</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "var(--text-3)", padding: "28px 14px" }}>
                  No commands to show.
                </td>
              </tr>
            ) : (
              rows.map((command) => {
                const date = command.dateIntervention ? new Date(command.dateIntervention) : null
                const lead = command.commandProducts[0]?.product.name
                const extra = command.commandProducts.length - 1
                const instName = command.instrumentiste
                  ? `${command.instrumentiste.name ?? ""} ${command.instrumentiste.familyName ?? ""}`.trim()
                  : ""

                return (
                  <tr key={command.id}>
                    <td>
                      <div className="ref">{command.reference}</div>
                      <div className="ref-sub">
                        {lead ? `${lead}${extra > 0 ? ` +${extra}` : ""}` : command.ville || "—"}
                      </div>
                    </td>
                    <td>
                      <span className={`chip ${command.type.toLowerCase()}`}>{command.type}</span>
                    </td>
                    <td>
                      <div className="cell-date">{date ? format(date, "dd MMM yyyy") : "—"}</div>
                      <div className="cell-mut">
                        {date ? format(date, "HH:mm") : "—"}
                        {command.ville ? ` · ${command.ville}` : ""}
                      </div>
                    </td>
                    <td>
                      <div className="cell-strong">{command.clinique || "—"}</div>
                      <div className="cell-mut">{command.doctorName || "—"}</div>
                    </td>
                    <td>
                      <span className={`status ${STATUS_CLASS[command.status]}`}>
                        <span className="sd" />
                        {STATUS_LABEL[command.status]}
                      </span>
                    </td>
                    <td>
                      <span className="cell-strong">{instName || "—"}</span>
                    </td>
                    <td>
                      <div className="row-act" style={{ justifyContent: "flex-end" }}>
                        {isAdmin ? (
                          <>
                            {canUpdate && (
                              <CommandDialog
                                command={{ ...command, modePaiement: command.modePaiement ?? undefined }}
                                productsList={products}
                                usersList={users}
                                trigger={
                                  <button className="act" title="Edit" type="button">
                                    <SquarePen />
                                  </button>
                                }
                              />
                            )}
                            {canStatus && (
                              <StatusDialog
                                id={command.id}
                                currentStatus={command.status}
                                trigger={
                                  <button className="act" title="Status" type="button">
                                    <Activity />
                                  </button>
                                }
                              />
                            )}
                            {canDelete && <DeleteCommandDialog id={command.id} />}
                          </>
                        ) : (
                          <>
                            <StatusDialog
                              id={command.id}
                              currentStatus={command.status}
                              allowedStatuses={[CommandStatus.REPORTEE, CommandStatus.ANNULEE, CommandStatus.COMPLETEE]}
                              trigger={
                                <button className="act" title="Status" type="button">
                                  <Activity />
                                </button>
                              }
                            />
                            {command.status === CommandStatus.COMPLETEE && (
                              <UploadReportDialog
                                id={command.id}
                                trigger={
                                  <button className="act" title="Upload report" type="button">
                                    <Link2 />
                                  </button>
                                }
                              />
                            )}
                          </>
                        )}
                        {command.completionReport && (
                          <a
                            className="act"
                            href={command.completionReport}
                            target="_blank"
                            rel="noreferrer"
                            title="View report"
                          >
                            <MoreVertical />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
