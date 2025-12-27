import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 gap-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to ABC App</h1>
      {session ? (
        <div className="text-center space-y-4">
          <p className="text-xl">Signed in as {session.user?.email}</p>
          <p className="text-muted-foreground">Role: {session.user?.role}</p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
                <Link href="/dashboard">
                    Go to Dashboard
                </Link>
            </Button>
            <Button variant="destructive" asChild>
                <Link href="/api/auth/signout">
                    Sign out
                </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
            <Button asChild>
                <Link href="/login">
                Sign in
                </Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/register">
                Register
                </Link>
            </Button>
        </div>
      )}
    </div>
  )
}
