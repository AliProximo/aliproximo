import { z } from "zod"

export const create = z.object({
  name: z.string(),
  registerNumber: z.string(),
  whatsapp: z.string(),
  address: z.object({
    address: z.string(),
    city: z.string(),
    latitude: z.string(),
    longitude: z.string(),
    neighborhood: z.string(),
    postalCode: z.string(),
    state: z.string(),
    street: z.string(),
    country: z.string().optional(),
  }),
  logoFilename: z.string(),
  owner: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }),
})