"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Download, ListFilter, MoreVertical } from "lucide-react"
import { Product, User, CommandStatus, ProthesisType } from "@/app/generated/prisma/browser"
import { CommandDialog } from "@/components/commands/CommandDialog"
import { DeleteCommandDialog } from "@/components/commands/DeleteCommandDialog"
import { StatusDialog } from "@/components/commands/StatusDialog"
import { UploadReportDialog } from "@/components/commands/UploadReportDialog"
import { SquarePen, Activity, Link2 } from "lucide-react"

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

interface CommandsTableProps {
  data: CommandRow[]
  products: Product[]
  users: User[]
  isAdmin: boolean
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

export function CommandsTable({ data, products, users, isAdmin }: CommandsTableProps) {
  const [segment, setSegment] = useState<SegmentKey>("ALL")

  const rows = segment === "ALL" ? data : data.filter((row) => row.status === segment)

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
        <div className="seg" style={{ marginLeft: 6 }}>
          {SEGMENTS.map((s) => (
            <button key={s.key} className={segment === s.key ? "on" : ""} onClick={() => setSegment(s.key)} type="button">
              {s.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="filter-chip" type="button" disabled aria-hidden>
            <ListFilter />
            Filter
          </button>
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
                            <StatusDialog
                              id={command.id}
                              currentStatus={command.status}
                              trigger={
                                <button className="act" title="Status" type="button">
                                  <Activity />
                                </button>
                              }
                            />
                            <DeleteCommandDialog id={command.id} />
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
