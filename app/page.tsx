import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Workflow,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const highlights = [
  {
    icon: Workflow,
    title: "Command workflow",
    description: "Track prosthetics orders from intake to delivery with a calm, structured interface.",
  },
  {
    icon: ShieldCheck,
    title: "Role-aware access",
    description: "Keep administrators and instrumentists in the right view with secure permissions.",
  },
  {
    icon: Zap,
    title: "Fast collaboration",
    description: "Update status, share reports, and notify your team without leaving the workspace.",
  },
]

const stats = [
  { value: "24/7", label: "Command visibility" },
  { value: "3", label: "Core workflows" },
  { value: "100%", label: "Mobile ready" },
]

const steps = [
  {
    number: "01",
    title: "Create a command",
    description: "Capture patient, clinic, delivery, and product details in one structured flow.",
  },
  {
    number: "02",
    title: "Coordinate the team",
    description: "Assign the right instrumentiste, update progress, and keep everyone aligned.",
  },
  {
    number: "03",
    title: "Deliver with confidence",
    description: "Attach reports, close the loop, and maintain a clear operational history.",
  },
]

export default async function Home() {
  const session = await getServerSession(authOptions)
  const signedIn = !!session

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--med-surface)] text-[var(--med-text-primary)]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-28 left-[-6rem] h-72 w-72 rounded-full bg-[var(--med-teal)]/15 blur-3xl" />
        <div className="absolute top-24 right-[-4rem] h-80 w-80 rounded-full bg-[var(--med-cyan)]/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-white/70 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-3xl border border-white/70 bg-white/85 px-4 py-3 shadow-[0_18px_40px_rgba(13,27,46,0.05)] backdrop-blur md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-[0_8px_18px_rgba(0,196,154,0.25)]"
              style={{ backgroundImage: "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)" }}
            >
              <span className="h-4 w-4 rounded-sm bg-white/90" />
            </span>
            <div className="leading-none">
              <div className="text-sm font-semibold tracking-[0.22em] text-[var(--med-text-muted)]">ABC</div>
              <div className="text-base font-semibold text-[var(--med-text-primary)]" style={{ fontFamily: "var(--font-dm-serif)" }}>
                SYNTHESE
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <a href="#features" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--med-text-secondary)] transition-colors hover:bg-[var(--med-surface)] hover:text-[var(--med-text-primary)]">
              Features
            </a>
            <a href="#workflow" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--med-text-secondary)] transition-colors hover:bg-[var(--med-surface)] hover:text-[var(--med-text-primary)]">
              Workflow
            </a>
            <a href="#access" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--med-text-secondary)] transition-colors hover:bg-[var(--med-surface)] hover:text-[var(--med-text-primary)]">
              Access
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden rounded-full px-4 text-[var(--med-text-secondary)] hover:bg-[var(--med-surface)] hover:text-[var(--med-text-primary)] sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="rounded-full px-4 shadow-[0_12px_26px_rgba(0,196,154,0.24)]" style={{ backgroundImage: "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)" }}>
              <Link href={signedIn ? "/dashboard" : "/register"}>
                {signedIn ? "Open dashboard" : "Get started"}
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:py-16">
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--med-border)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--med-text-secondary)] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[var(--med-teal)]" />
              Clinical operations, redesigned
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--med-text-primary)] sm:text-5xl lg:text-7xl" style={{ fontFamily: "var(--font-dm-serif)" }}>
                A calmer way to manage prosthetics commands.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--med-text-secondary)] sm:text-lg">
                ABC SYNTHESE brings together command tracking, product coordination, and role-based workflows in one elegant workspace built for modern clinical teams.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-full px-6 text-base shadow-[0_16px_30px_rgba(0,196,154,0.24)]" style={{ backgroundImage: "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)" }}>
                <Link href={signedIn ? "/dashboard" : "/register"}>
                  {signedIn ? "Continue to dashboard" : "Start free access"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full border-[var(--med-border)] bg-white/90 px-6 text-base text-[var(--med-text-primary)] hover:bg-[var(--med-surface)]">
                <Link href="/login">View sign in</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_14px_30px_rgba(13,27,46,0.05)] backdrop-blur">
                  <div className="text-2xl font-semibold text-[var(--med-text-primary)]" style={{ fontFamily: "var(--font-dm-serif)" }}>
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-[var(--med-text-secondary)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="relative mx-auto max-w-xl">
              <div className="absolute -left-4 top-12 hidden rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_18px_40px_rgba(13,27,46,0.08)] backdrop-blur lg:block">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--med-text-muted)]">Live status</div>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-[var(--med-text-primary)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--med-teal)]" />
                  12 commands updated today
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.96))] shadow-[0_28px_80px_rgba(13,27,46,0.14)]">
                <div className="border-b border-[var(--med-border)] bg-[var(--med-navy)] px-5 py-4 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#00C49A]">Dashboard preview</div>
                      <div className="mt-1 text-xl font-semibold" style={{ fontFamily: "var(--font-dm-serif)" }}>
                        Clinical command board
                      </div>
                    </div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                      Secure workspace
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--med-border)] bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF9F5] text-[#0D7B5F]">
                        <ClipboardList className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--med-text-primary)]">Command flow</div>
                        <div className="text-xs text-[var(--med-text-muted)]">Structured intake to delivery</div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        { label: "Pending", tone: "bg-[#EFF6FF] text-[#2563EB]" },
                        { label: "Assigned", tone: "bg-[#ECFDF7] text-[#0D7B5F]" },
                        { label: "Completed", tone: "bg-[#F3EEFF] text-[#6D28D9]" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-xl border border-[var(--med-border)] px-3 py-2">
                          <span className="text-sm text-[var(--med-text-secondary)]">{item.label}</span>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.tone}`}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--med-border)] bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--med-text-primary)]">Operational signal</div>
                        <div className="text-xs text-[var(--med-text-muted)]">Focused visibility for teams</div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-[linear-gradient(135deg,rgba(0,196,154,0.08),rgba(14,165,233,0.08))] p-4">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <div className="text-3xl font-semibold text-[var(--med-text-primary)]" style={{ fontFamily: "var(--font-dm-serif)" }}>
                            98%
                          </div>
                          <div className="text-xs text-[var(--med-text-secondary)]">Tasks updated on time</div>
                        </div>
                        <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#0D7B5F] shadow-sm">
                          Smooth cadence
                        </div>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-white/70">
                        <div className="h-2 w-[84%] rounded-full bg-[linear-gradient(135deg,#00C49A_0%,#0EA5E9_100%)]" />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--med-text-muted)]">
                      <span className="rounded-full bg-[var(--med-surface)] px-3 py-1">Mobile ready</span>
                      <span className="rounded-full bg-[var(--med-surface)] px-3 py-1">Audit friendly</span>
                      <span className="rounded-full bg-[var(--med-surface)] px-3 py-1">Role based</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 right-4 hidden rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_18px_40px_rgba(13,27,46,0.08)] backdrop-blur sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3EEFF] text-[#6D28D9]">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--med-text-muted)]">Team sync</div>
                    <div className="text-sm font-semibold text-[var(--med-text-primary)]">2 clinics active now</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="features" className="grid gap-4 border-t border-white/70 pt-6 sm:grid-cols-3 lg:pt-8">
          {highlights.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.title} className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-[0_14px_30px_rgba(13,27,46,0.05)] backdrop-blur">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(0,196,154,0.12),rgba(14,165,233,0.12))] text-[#0D7B5F]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-[var(--med-text-primary)]">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--med-text-secondary)]">{item.description}</p>
              </article>
            )
          })}
        </div>

        <div id="workflow" className="mt-6 rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_18px_40px_rgba(13,27,46,0.05)] backdrop-blur lg:p-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--med-text-muted)]">Workflow</div>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--med-text-primary)]" style={{ fontFamily: "var(--font-dm-serif)" }}>
                Designed around how clinical teams actually work.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-[var(--med-text-secondary)]">
              The product keeps the interface calm, the hierarchy clear, and the important actions visible on both desktop and mobile.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="rounded-2xl border border-[var(--med-border)] bg-[var(--med-surface)] p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--med-text-muted)]">{step.number}</div>
                <h3 className="mt-3 text-lg font-semibold text-[var(--med-text-primary)]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--med-text-secondary)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="access" className="mt-6 flex flex-col gap-4 rounded-[2rem] border border-[var(--med-border)] bg-[var(--med-navy)] px-6 py-6 text-white shadow-[0_18px_40px_rgba(13,27,46,0.08)] lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#00C49A]">Ready to start</div>
            <h2 className="mt-2 text-2xl font-semibold" style={{ fontFamily: "var(--font-dm-serif)" }}>
              Open the dashboard, or create an account in less than a minute.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Built for quick access, smooth collaboration, and a crisp experience that feels native on phones and large screens alike.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-full px-5" style={{ backgroundImage: "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)" }}>
              <Link href={signedIn ? "/dashboard" : "/register"}>
                {signedIn ? "Open dashboard" : "Create account"}
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/15 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
