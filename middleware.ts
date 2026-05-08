import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const role = token?.role
    const approved = token?.approved
    const email = token?.email
    const path = req.nextUrl.pathname

    const isSuperAdmin =
      !!process.env.EMAILADMIN && email === process.env.EMAILADMIN

    // Unapproved users (other than the super admin) get bounced to /pending.
    // They keep a valid session but can't reach any /dashboard route.
    if (!approved && !isSuperAdmin && path.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/pending", req.url))
    }

    // Approved users hitting /pending get sent into the dashboard.
    if (approved && path === "/pending") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Approvals page is super-admin only.
    if (path.startsWith("/dashboard/approvals") && !isSuperAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Admin only routes
    if (path.startsWith("/dashboard/products") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Default redirect for /dashboard to /dashboard/commands if accessed directly
    // if (path === "/dashboard") {
    //     return NextResponse.redirect(new URL("/dashboard/commands", req.url))
    // }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    // This tells NextAuth to redirect to "/" if the authorized callback returns false
    pages: {
      signIn: "/",
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/pending"]
}
