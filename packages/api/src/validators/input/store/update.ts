import { z } from "zod";

export const update = z.object({
  id: z.string().cuid(),
  name: z
    .string({
      required_error: "nome da loja é obrigatório",
      invalid_type_error: "nome precisa ser um texto não vazio",
    })
    .min(1, { message: "Não pode ser vazio" })
    .optional(),
  registerNumber: z
    .string({
      required_error: "número de registro (CNPJ/CPF) é obrigatório",
      invalid_type_error:
        "número de registro precisa ser um texto do formato CNPJ ou CPF",
    })
    .min(1, { message: "Não pode ser vazio" })
    .optional(),
  whatsapp: z
    .string({
      required_error: "número de WhatsApp é obrigatório",
      invalid_type_error:
        "número de WhatsApp precisa ser um texto do formato telefone",
    })
    .min(1, { message: "Não pode ser vazio" })
    .optional(),
  address: z
    .object({
      postalCode: z.string().min(1, { message: "Não pode ser vazio" }),
      address: z.string(),
      state: z.string().min(1, { message: "Não pode ser vazio" }),
      city: z.string().min(1, { message: "Não pode ser vazio" }),
      neighborhood: z.string().min(1, { message: "Não pode ser vazio" }),
      street: z.string().optional(),
      country: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      location: z.number().optional(),
    })
    .optional(),
  logoFilename: z.string().optional(),
  owner: z
    .object({
      name: z.string().min(1, { message: "Não pode ser vazio" }),
      email: z
        .string()
        .email({ message: "Formato de email inválido" })
        .min(1, { message: "Não pode ser vazio" }),
      phone: z.string().min(1, { message: "Não pode ser vazio" }),
    })
    .optional(),
});
