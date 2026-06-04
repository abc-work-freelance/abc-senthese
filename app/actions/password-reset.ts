"use server"

import { prisma } from "@/lib/prisma"
import { hash, compare } from "bcryptjs"
import { randomInt } from "node:crypto"
import { notifyPasswordReset } from "@/lib/whatsapp"

const CODE_TTL_MINUTES = 15
const MAX_ATTEMPTS = 5

const SENT_MESSAGE =
  "We sent a 6-digit verification code to the WhatsApp number on your account."
// Used both for unknown emails and accounts with no phone / failed delivery, so
// the response can't be used to tell whether a given email is registered.
const NOT_SENT_MESSAGE =
  "We couldn't send a verification code. The account may not have a phone number on file — please contact an administrator."

type RequestResult = {
  success: boolean
  message: string
  // Tells the UI whether a code actually went out (so it only advances to the
  // code-entry step when there's a code to enter).
  channel?: "whatsapp" | "none"
}

/**
 * Start the password-reset flow: generate a single-use 6-digit code, store only
 * its hash, and deliver the code over WhatsApp. Always resolves with a generic
 * message to avoid user enumeration.
 */
export async function requestPasswordReset(emailRaw: string): Promise<RequestResult> {
  const email = (emailRaw ?? "").trim()

  if (!email || !email.includes("@")) {
    return { success: false, message: "Please enter a valid email address." }
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, phone: true },
  })

  if (!user) {
    // Behave identically to the "couldn't send" path so unknown emails and
    // phone-less accounts are indistinguishable.
    return { success: true, message: NOT_SENT_MESSAGE, channel: "none" }
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0")
  const codeHash = await hash(code, 10)
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000)

  // Replace any previous codes so only the newest one is valid.
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({ data: { userId: user.id, codeHash, expiresAt } }),
  ])

  const result = await notifyPasswordReset(user.phone, user.name, code, CODE_TTL_MINUTES)

  // Dev fallback so the flow is testable when WhatsApp can't deliver (no phone,
  // sandbox recipient not allow-listed, expired token, etc.). Never in prod.
  if (!result.success && process.env.NODE_ENV !== "production") {
    console.info(
      `\n[password-reset] WhatsApp delivery unavailable — code for ${email}: ${code} (valid ${CODE_TTL_MINUTES}m)\n`
    )
  }

  return {
    success: true,
    message: result.success ? SENT_MESSAGE : NOT_SENT_MESSAGE,
    channel: result.success ? "whatsapp" : "none",
  }
}

type ResetResult = { success: boolean; message: string }

/**
 * Complete the flow: verify the code and set a new password. Codes are
 * single-use, time-limited, and rate-limited via the attempts counter.
 */
export async function resetPassword(
  emailRaw: string,
  codeRaw: string,
  newPassword: string
): Promise<ResetResult> {
  const email = (emailRaw ?? "").trim()
  const code = (codeRaw ?? "").trim()

  if (!/^\d{6}$/.test(code)) {
    return { success: false, message: "Enter the 6-digit code from your message." }
  }
  if (!newPassword || newPassword.length < 8) {
    return { success: false, message: "Password must be at least 8 characters long." }
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (!user) {
    return { success: false, message: "Invalid or expired code. Please request a new one." }
  }

  const token = await prisma.passwordResetToken.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  if (!token || token.expiresAt < new Date()) {
    if (token) await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })
    return { success: false, message: "Invalid or expired code. Please request a new one." }
  }

  if (token.attempts >= MAX_ATTEMPTS) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })
    return { success: false, message: "Too many attempts. Please request a new code." }
  }

  const matches = await compare(code, token.codeHash)
  if (!matches) {
    const used = token.attempts + 1
    if (used >= MAX_ATTEMPTS) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })
      return { success: false, message: "Too many attempts. Please request a new code." }
    }
    await prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { attempts: { increment: 1 } },
    })
    const left = MAX_ATTEMPTS - used
    return { success: false, message: `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.` }
  }

  const hashedPassword = await hash(newPassword, 10)
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
  ])

  return { success: true, message: "Password updated. You can now sign in." }
}
