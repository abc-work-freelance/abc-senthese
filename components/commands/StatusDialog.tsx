"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateCommandStatus } from "@/app/actions/commands"
import { useToast } from "@/components/ui/toast"
import { CommandStatus } from "@/app/generated/prisma/browser"
import { Activity } from "lucide-react"
import { useRouter } from "next/navigation"

interface StatusDialogProps {
  id: number
  currentStatus: CommandStatus
  allowedStatuses?: CommandStatus[] // Optional: Restrict available statuses
  trigger?: React.ReactNode
}

export function StatusDialog({ id, currentStatus, allowedStatuses, trigger }: StatusDialogProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<CommandStatus>(currentStatus)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const router = useRouter()

  const handleUpdate = async () => {
    setSaving(true)
    try {
      const result = await updateCommandStatus(id, status)
      if (result.success) {
        toast.success("Status updated.")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.message || "Failed to update status.")
      }
    } catch (error) {
      console.error("Failed to update status", error)
      toast.error("Failed to update status. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const statuses = allowedStatuses || Object.values(CommandStatus)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-[#0D7B5F] transition-colors hover:bg-[#EBF9F5] hover:text-[#0D7B5F]" title="Update Status">
            <Activity className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" style={{ borderRadius: '16px' }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '24px' }} className="text-foreground">Update Status</DialogTitle>
          <DialogDescription style={{ fontSize: '13px' }} className="text-muted-foreground">
            Change the status of this command.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <Select onValueChange={(val) => setStatus(val as CommandStatus)} defaultValue={status}>
                <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    {statuses.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate} disabled={saving}>
            {saving ? "Updating…" : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
