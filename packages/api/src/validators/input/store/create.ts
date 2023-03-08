import { z } from "zod";

export const create = z.object({
  name: z
    .string({
      required_error: "nome da loja é obrigatório",
      invalid_type_error: "nome precisa ser um texto não vazio",
    })
    .min(1, { message: "Não pode ser vazio" }),
  registerNumber: z
    .string({
      required_error: "número de registro (CNPJ/CPF) é obrigatório",
      invalid_type_error:
        "número de registro precisa ser um texto do formato CNPJ ou CPF",
    })
    .min(1, { message: "Não pode ser vazio" }),
  whatsapp: z
    .string({
      required_error: "número de WhatsApp é obrigatório",
      invalid_type_error:
        "número de WhatsApp precisa ser um texto do formato telefone",
    })
    .min(1, { message: "Não pode ser vazio" }),
  address: z.object({
    postalCode: z.string().min(1, { message: "Não pode ser vazio" }),
    address: z.string(),
    state: z.string().min(1, { message: "Não pode ser vazio" }),
    city: z.string().min(1, { message: "Não pode ser vazio" }),
    neighborhood: z.string().min(1, { message: "Não pode ser vazio" }),
    street: z.string().optional(),
    country: z.string().optional(),
    // TODO: remove default values when client code update
    latitude: z.number().default(-15.7901772), //.optional(),
    longitude: z.number().default(-47.9355249), //.optional(),
    location: z.number().optional(),
  }),
  logoFilename: z.string(),
  owner: z.object({
    name: z.string().min(1, { message: "Não pode ser vazio" }),
    email: z
      .string()
      .email({ message: "Formato de email inválido" })
      .min(1, { message: "Não pode ser vazio" }),
    phone: z.string().min(1, { message: "Não pode ser vazio" }),
  }),
});
