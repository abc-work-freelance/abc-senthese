import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role
    const path = req.nextUrl.pathname

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
  matcher: ["/dashboard/:path*"] 
}