"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    familyName: "",
    email: "",
    phone: "",
    password: "",
    role: "INSTRUMENTISTE",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push("/login?registered=true")
      } else {
        const data = await res.json()
        setError(data.message || "Registration failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" style={{ backgroundColor: "var(--med-surface)" }}>
      {/* Left Side - Branding (Mobile Hidden) */}
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

          {/* Welcome Message */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                Join Our <br /> Clinical Network
              </h2>
              <p className="text-white/70 text-lg">
                Register to access the modern prosthetics management platform trusted by healthcare professionals.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-[#00C49A] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Efficient Command Management</p>
                  <p className="text-white/60 text-sm">Streamline surgical prosthetics orders</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-[#00C49A] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Real-time Collaboration</p>
                  <p className="text-white/60 text-sm">Work seamlessly with teams and clinics</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-[#00C49A] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Secure & Compliant</p>
                  <p className="text-white/60 text-sm">Healthcare-grade security standards</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="relative z-10 text-white/60 text-sm">
          Quick setup • Enterprise-ready • HIPAA compliant
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-12 overflow-y-auto">
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
              Create Account
            </h1>
            <p className="text-[#94A3B8] text-sm">
              Register to join the ABC SYNTHESE clinical network
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A2332] mb-2">First Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#E8ECF0] bg-white text-[#1A2332] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#00C49A] focus:border-transparent transition-all"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2332] mb-2">Family Name</label>
                <input
                  type="text"
                  name="familyName"
                  value={formData.familyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#E8ECF0] bg-white text-[#1A2332] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#00C49A] focus:border-transparent transition-all"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[#1A2332] mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[#E8ECF0] bg-white text-[#1A2332] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#00C49A] focus:border-transparent transition-all"
                placeholder="john.doe@clinic.com"
                required
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-[#1A2332] mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[#E8ECF0] bg-white text-[#1A2332] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#00C49A] focus:border-transparent transition-all"
                placeholder="+212 6 00 00 00 00"
              />
              <p className="mt-2 text-xs text-[#94A3B8]">
                International format (e.g. +212600000000) — used for WhatsApp notifications
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-[#1A2332] mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[#E8ECF0] bg-white text-[#1A2332] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#00C49A] focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
              <p className="mt-2 text-xs text-[#94A3B8]">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-[#1A2332] mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[#E8ECF0] bg-white text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#00C49A] focus:border-transparent transition-all cursor-pointer"
              >
                <option value="INSTRUMENTISTE">Instrumentiste (Clinical Staff)</option>
                <option value="ADMIN">Administrator</option>
              </select>
              <p className="mt-2 text-xs text-[#94A3B8]">
                Select your role within the organization
              </p>
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
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              style={{
                backgroundImage: "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)",
              }}
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-8 border-t border-[#E8ECF0]">
            <p className="text-center text-[#94A3B8] text-sm">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="font-semibold text-[#00C49A] hover:text-[#0D7B5F] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Role</label>
//             <select
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="INSTRUMENTISTE">Instrumentiste</option>
//               <option value="ADMIN">Admin</option>
//             </select>
//           </div>
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
//           >
//             {loading ? "Registering..." : "Register"}
//           </button>
//         </form>
//         <div className="text-center text-sm">
//             <span className="text-gray-600">Already have an account? </span>
//             <Link href="/login" className="text-blue-600 hover:text-blue-500">
//                 Sign in
//             </Link>
//         </div>
//       </div>
//     </div>
//   )
// }
