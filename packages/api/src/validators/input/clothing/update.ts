/* WARNING: should not use @prisma/client directly, get alternative later */
import { SizeOptions } from "@prisma/client";
import isDecimal from "validator/lib/isDecimal";
import { z } from "zod";

export const update = z.object({
  id: z.string().cuid(),
  sizes: z.nativeEnum(SizeOptions).array().optional(),
  // product data
  name: z.string().optional(),
  location: z.number().optional(),
  quantity: z.number().int().gte(0).optional(),
  description: z.string().optional(),
  price: z
    .string()
    .refine(
      (value) =>
        isDecimal(value, {
          decimal_digits: "1,3",
          locale: "en-US",
        }),
      {
        message: "Invalid decimal value",
      },
    )
    .optional(),
  available: z.boolean().optional(),
  photoFilename: z.string().optional(),
  category: z
    .object({ id: z.string().cuid(), name: z.undefined() })
    .or(z.object({ id: z.undefined(), name: z.string() }))
    .optional(),
});
