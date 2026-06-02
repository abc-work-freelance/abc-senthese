import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import LandingPage from "@/components/landing/LandingPage"

export default async function Home() {
  const session = await getServerSession(authOptions)
  return <LandingPage signedIn={!!session} />
}
