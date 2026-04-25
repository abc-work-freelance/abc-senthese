"use client"

import { useState, useTransition } from "react"
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
import { uploadCommandCompletionReport } from "@/app/actions/commands"
import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"
import { useRouter } from "next/navigation"

type UploadReportDialogProps = {
  id: number
  trigger?: React.ReactNode
}

const SERVER_ACTION_LIMIT_BYTES = 1024 * 1024
// Keep a small buffer for multipart/form-data overhead.
const SAFE_FILE_LIMIT_BYTES = 950 * 1024

function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function UploadReportDialog({ id, trigger }: UploadReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleUpload = () => {
    if (!file) {
      setFeedback({ success: false, message: "Please select a file." })
      return
    }

    if (file.size > SAFE_FILE_LIMIT_BYTES) {
      setFeedback({
        success: false,
        message: `File too large (${formatSize(file.size)}). Upload limit is 1 MB for this version. Please use a file under ${formatSize(SAFE_FILE_LIMIT_BYTES)}.`,
      })
      return
    }

    setFeedback(null)

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append("file", file)

        const result = await uploadCommandCompletionReport(id, formData)
        setFeedback({ success: result.success, message: result.message })

        if (result.success) {
          setFile(null)
          router.refresh()
          setTimeout(() => setOpen(false), 500)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed."
        const isBodyLimitError = errorMessage.toLowerCase().includes("body exceeded")

        setFeedback({
          success: false,
          message: isBodyLimitError
            ? `Upload failed: file exceeds the 1 MB Server Action limit. Please upload a file smaller than ${formatSize(SAFE_FILE_LIMIT_BYTES)}.`
            : "Upload failed. Please try again.",
        })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-[#0D7B5F] transition-colors hover:bg-[#EBF9F5] hover:text-[#0D7B5F]">
            <Upload className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]" style={{ borderRadius: "16px" }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-dm-serif)", fontSize: "24px", color: "#1A2332" }}>
            Upload Completion Report
          </DialogTitle>
          <DialogDescription style={{ color: "#94A3B8", fontSize: "13px" }}>
            Attach the intervention completion file for this command.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#374151]">
            File (PDF, PNG, JPG, DOC, DOCX)
          </label>
          <Input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            className="border-[#E8ECF0] bg-white"
            style={{ borderRadius: "10px" }}
            onChange={(event) => {
              const nextFile = event.target.files?.[0] ?? null
              setFile(nextFile)

              if (nextFile && nextFile.size > SAFE_FILE_LIMIT_BYTES) {
                setFeedback({
                  success: false,
                  message: `Selected file is ${formatSize(nextFile.size)}. Limit is 1 MB for this version.`,
                })
              } else {
                setFeedback(null)
              }
            }}
          />
          <p className="text-xs text-[#94A3B8]">
            Current Server Action request limit: {formatSize(SERVER_ACTION_LIMIT_BYTES)}.
          </p>
        </div>

        {feedback && (
          <p className="text-sm" style={{ color: feedback.success ? "#10B981" : "#EF4444" }}>
            {feedback.message}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isPending}
            style={{
              backgroundImage: "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)",
              boxShadow: "0 4px 14px rgba(0,196,154,0.3)",
              borderRadius: "10px",
              color: "#FFFFFF",
            }}
            className="hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,196,154,0.28)]"
          >
            {isPending ? "Uploading..." : "Upload file"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
