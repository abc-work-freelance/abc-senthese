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
  const router = useRouter()

  const handleUpdate = async () => {
    try {
      const result = await updateCommandStatus(id, status)
      if (result.success) {
        setOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to update status", error)
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
          <DialogTitle style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '24px', color: '#1A2332' }}>Update Status</DialogTitle>
          <DialogDescription style={{ color: '#94A3B8', fontSize: '13px' }}>
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
          <Button
            onClick={handleUpdate}
            style={{
              backgroundImage: 'linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)',
              boxShadow: '0 4px 14px rgba(0,196,154,0.3)',
              borderRadius: '10px',
              color: '#FFFFFF',
            }}
            className="hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,196,154,0.28)]"
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
