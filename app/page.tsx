import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome</h1>
      {session ? (
        <div className="text-center">
          <p className="mb-4">Signed in as {session.user?.email}</p>
          <p className="mb-4">Role: {session.user?.role}</p>
          <Link href="/api/auth/signout" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Sign out
          </Link>
        </div>
      ) : (
        <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Sign in
        </Link>
      )}
    </div>
  )
}
