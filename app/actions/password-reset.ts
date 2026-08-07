"use server"

import { prisma } from "@/lib/prisma"
import { hash, compare } from "bcryptjs"
import { randomInt } from "node:crypto"
import { sendPasswordResetEmail } from "@/lib/email"
import { notifyPasswordReset } from "@/lib/whatsapp"

const CODE_TTL_MINUTES = 15
const MAX_ATTEMPTS = 5

const SENT_MESSAGE =
  "We sent a 6-digit verification code to your email inbox and/or WhatsApp."
const NOT_SENT_MESSAGE =
  "We couldn't send a verification code. Please make sure your email address and/or phone number are correct or contact an administrator."

type RequestResult = {
  success: boolean
  message: string
  channel?: "email" | "whatsapp" | "both" | "none"
}

/**
 * Start the password-reset flow: generate a single-use 6-digit code, store only
 * its hash, and deliver the code over email and WhatsApp. Always resolves with a generic
 * message to avoid user enumeration.
 */
export async function requestPasswordReset(emailRaw: string): Promise<RequestResult> {
  const email = (emailRaw ?? "").trim().toLowerCase()

  if (!email || !email.includes("@")) {
    return { success: false, message: "Please enter a valid email address." }
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, familyName: true, email: true, phone: true },
  })

  if (!user) {
    // Behave identically to the "couldn't send" path so unknown emails are indistinguishable.
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

  // Send email notification
  const emailResult = await sendPasswordResetEmail({
    to: user.email,
    userName: user.name,
    code,
    ttlMinutes: CODE_TTL_MINUTES,
  })

  // Send WhatsApp notification if phone number is available
  let whatsappSuccess = false
  if (user.phone) {
    const fullName = `${user.name} ${user.familyName}`.trim()
    const whatsappResult = await notifyPasswordReset(user.phone, fullName, code, CODE_TTL_MINUTES)
    whatsappSuccess = whatsappResult.success
  }

  if (!emailResult.success && !whatsappSuccess && process.env.NODE_ENV !== "production") {
    console.info(
      `\n[password-reset] All delivery failed — code for ${email}: ${code} (valid ${CODE_TTL_MINUTES}m)\n`
    )
  }

  // Determine which channels succeeded
  let channel: "email" | "whatsapp" | "both" | "none" = "none"
  if (emailResult.success && whatsappSuccess) {
    channel = "both"
  } else if (emailResult.success) {
    channel = "email"
  } else if (whatsappSuccess) {
    channel = "whatsapp"
  }

  return {
    success: true,
    message: (emailResult.success || whatsappSuccess) ? SENT_MESSAGE : NOT_SENT_MESSAGE,
    channel,
  }
}

type ResetResult = { success: boolean; message: string }

/**
 * Complete the flow: verify the code and set a new password. Codes are
 * single-use, time-limited, and rate-limited via the attempts counter.
 * The code can be received via email, WhatsApp, or both.
 */
export async function resetPassword(
  emailRaw: string,
  codeRaw: string,
  newPassword: string
): Promise<ResetResult> {
  const email = (emailRaw ?? "").trim().toLowerCase()
  const code = (codeRaw ?? "").trim()

  if (!/^\d{6}$/.test(code)) {
    return { success: false, message: "Enter the 6-digit code from your email inbox or WhatsApp." }
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
