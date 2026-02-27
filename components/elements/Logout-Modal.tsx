"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { signOut } from "next-auth/react"

export function LogoutModal({children}: {children: any}) {
  const handleLogOut = async () => {
    await signOut()
    
  }
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
            <span>
                {children}
            </span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Log Out</DialogTitle>
            <DialogDescription>
              Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant={"destructive"} onClick={handleLogOut}>Logout</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
