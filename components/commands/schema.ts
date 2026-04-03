import { z } from "zod"
import { ProthesisType, PaymentMode } from "@/app/generated/prisma/browser"

export const commandSchema = z.object({
  reference: z.string().min(1, "Reference is required"),
  type: z.nativeEnum(ProthesisType),
  dateIntervention: z.date(),
  dateLivraison: z.date(),
  lienIntervention: z.string().optional(),
  ville: z.string().min(1, "Ville is required"),
  address: z.string().optional(),
  clinique: z.string().optional(),
  doctorName: z.string().optional(),
  modePaiement: z.nativeEnum(PaymentMode),
  commentaire: z.string().optional(),
  instrumentisteId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  // For now, simple product selection might be complex, we can add it later or as a separate step
  // But let's add a basic structure for products if needed
  products: z.array(z.object({
      productId: z.number(),
      quantity: z.number().min(1)
  })).optional()
})

export type CommandFormValues = z.infer<typeof commandSchema>
