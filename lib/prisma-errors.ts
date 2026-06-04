// Lightweight, dependency-free helpers for turning Prisma's known error codes
// into user-facing messages. We duck-type on `code`/`meta` so we don't have to
// import the generated runtime error classes.

type PrismaKnownError = {
  code?: string
  meta?: {
    // Classic Prisma engine shape.
    target?: string[] | string
    // Driver-adapter (e.g. @prisma/adapter-pg) shape — the violated columns
    // live under cause.constraint.fields, with the raw SQL message alongside.
    driverAdapterError?: {
      cause?: {
        originalMessage?: string
        constraint?: { fields?: string[] }
      }
    }
  }
}

function asPrismaError(error: unknown): PrismaKnownError | null {
  if (error && typeof error === "object" && "code" in error) {
    return error as PrismaKnownError
  }
  return null
}

// Gather every place that can name the violated column(s) into one lowercase
// blob so a simple substring test works regardless of the Prisma error shape.
function constraintHaystack(err: PrismaKnownError): string {
  const parts: string[] = []

  const target = err.meta?.target
  if (Array.isArray(target)) parts.push(...target)
  else if (typeof target === "string") parts.push(target)

  const cause = err.meta?.driverAdapterError?.cause
  if (Array.isArray(cause?.constraint?.fields)) parts.push(...cause.constraint.fields)
  if (typeof cause?.originalMessage === "string") parts.push(cause.originalMessage)

  return parts.join(" ").toLowerCase()
}

/**
 * True when the error is a unique-constraint violation (P2002). When `field` is
 * given, also checks that the violated constraint targets that column — matching
 * both the classic `meta.target` and the driver-adapter constraint shape.
 */
export function isUniqueConstraintError(error: unknown, field?: string): boolean {
  const err = asPrismaError(error)
  if (err?.code !== "P2002") return false
  if (!field) return true
  return constraintHaystack(err).includes(field.toLowerCase())
}

/** True when the operation targeted a row that no longer exists (P2025). */
export function isRecordNotFoundError(error: unknown): boolean {
  return asPrismaError(error)?.code === "P2025"
}
