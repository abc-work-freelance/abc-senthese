"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteCommand } from "@/app/actions/commands"
import { useToast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"

interface DeleteCommandDialogProps {
  id: number
}

export function DeleteCommandDialog({ id }: DeleteCommandDialogProps) {
  const toast = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    try {
      const result = await deleteCommand(id)
      if (result?.success) {
        toast.success("Command deleted.")
        router.refresh()
      } else {
        toast.error(result?.message || "Failed to delete command.")
      }
    } catch (error) {
      console.error("Failed to delete command", error)
      toast.error("Failed to delete command. Please try again.")
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-red-500 transition-colors hover:bg-[#EBF9F5] hover:text-[#0D7B5F]">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the command.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
