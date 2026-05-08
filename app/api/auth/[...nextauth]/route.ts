import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        // Super admin (EMAILADMIN) is always treated as approved, and we
        // self-heal the DB row so the approvals UI doesn't show them as pending.
        let approved = user.approved
        if (process.env.EMAILADMIN && user.email === process.env.EMAILADMIN && !approved) {
          await prisma.user.update({
            where: { id: user.id },
            data: { approved: true },
          })
          approved = true
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          approved,
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
         session.user.id = token.id as string;
         session.user.role = token.role as any;
         session.user.approved = token.approved as boolean;
      }
      return session
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.approved = user.approved
      }
      // Re-fetch approved state from DB on session update so newly approved
      // users don't have to log out and back in to gain access.
      if (trigger === "update" && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: Number(token.id) },
          select: { approved: true },
        })
        if (fresh) token.approved = fresh.approved
      }
      return token
    }
  },
  session: {
      strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
