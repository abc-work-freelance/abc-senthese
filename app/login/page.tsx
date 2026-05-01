"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError("Invalid email or password")
      setIsLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" style={{ backgroundColor: "var(--med-surface)" }}>
      {/* Left Side - Branding & Features */}
      <div 
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "var(--med-navy)" }}
      >
        {/* Gradient Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute top-0 -left-40 w-80 h-80 rounded-full blur-3xl"
            style={{ backgroundImage: "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)" }}
          />
          <div 
            className="absolute bottom-0 -right-40 w-80 h-80 rounded-full blur-3xl"
            style={{ backgroundImage: "linear-gradient(135deg, #0EA5E9 0%, #00C49A 100%)" }}
          />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-xl shadow-[0_8px_18px_rgba(0,196,154,0.25)]"
              style={{
                backgroundImage: "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)",
              }}
            >
              <span className="h-5 w-5 rounded-sm bg-white/90" />
            </span>
            <div className="flex flex-col">
              <span className="text-2xl font-semibold tracking-tight text-white" style={{ fontFamily: "var(--font-dm-serif)" }}>
                ABC SYNTHESE
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#00C49A]">
                Prosthetics Management
              </span>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight mb-8">
              Clinical Command <br /> Intelligence
            </h2>

            {[
              { title: "Real-time Tracking", desc: "Monitor surgical prosthetics commands with live updates" },
              { title: "Secure Authentication", desc: "Enterprise-grade security for healthcare data" },
              { title: "Collaborative Workspace", desc: "Seamless coordination between teams and clinics" },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 items-start">
                <CheckCircle2 className="h-6 w-6 text-[#00C49A] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Text */}
        <div className="relative z-10 text-white/60 text-sm">
          Trusted by clinical teams across multiple healthcare facilities
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-12">
        <div className="w-full max-w-sm mx-auto lg:mx-0">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-lg shadow-[0_8px_18px_rgba(0,196,154,0.25)]"
              style={{
                backgroundImage: "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)",
              }}
            >
              <span className="h-4 w-4 rounded-sm bg-white/90" />
            </span>
            <span className="text-lg font-semibold text-[#1A2332]" style={{ fontFamily: "var(--font-dm-serif)" }}>
              ABC SYNTHESE
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1A2332] mb-2" style={{ fontFamily: "var(--font-dm-serif)" }}>
              Welcome Back
            </h1>
            <p className="text-[#94A3B8] text-sm">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[#1A2332] mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#E8ECF0] bg-white text-[#1A2332] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#00C49A] focus:border-transparent transition-all"
                placeholder="name@clinic.com"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-[#1A2332] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#E8ECF0] bg-white text-[#1A2332] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#00C49A] focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundImage: "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)",
              }}
            >
              {isLoading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-8 pt-8 border-t border-[#E8ECF0]">
            <p className="text-center text-[#94A3B8] text-sm">
              Don't have an account?{" "}
              <Link 
                href="/register" 
                className="font-semibold text-[#00C49A] hover:text-[#0D7B5F] transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
