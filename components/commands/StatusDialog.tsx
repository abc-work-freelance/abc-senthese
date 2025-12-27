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
import { CommandStatus } from "@/app/generated/prisma/browser"
import { Activity } from "lucide-react"

interface StatusDialogProps {
  id: number
  currentStatus: CommandStatus
  allowedStatuses?: CommandStatus[] // Optional: Restrict available statuses
}

export function StatusDialog({ id, currentStatus, allowedStatuses }: StatusDialogProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<CommandStatus>(currentStatus)

  const handleUpdate = async () => {
    try {
      await updateCommandStatus(id, status)
      setOpen(false)
    } catch (error) {
      console.error("Failed to update status", error)
    }
  }

  const statuses = allowedStatuses || Object.values(CommandStatus)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Update Status">
          <Activity className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>
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
          <Button onClick={handleUpdate}>Update Status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
