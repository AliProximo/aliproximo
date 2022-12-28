import { Role } from '@aliproximo/db'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createRbacProcedure, router } from '../trpc'

const userProcedure = createRbacProcedure({
  requiredRoles: ["Admin", "Manager", "Moderator"],
})
const adminProcedure = createRbacProcedure({
  requiredRoles: ["Admin"],
})

export const userRouter = router({
  all: userProcedure
    .input(
      z.object({
        name: z.string().optional(),
        roles: z.nativeEnum(Role).array().optional(),
        active: z.boolean().default(true),
        // TODO: pagination
        // take: z.number().gte(0).optional(),
        // skip: z.number().gte(0).optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          id: {
            not: {
              equals: ctx.session?.user?.id,
            },
          },
          name: {
            contains: input.name,
          },
          role: {
            in: input.roles,
          },
          active: input.active
        }
      })
    }),
  update: userProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        active: z.boolean().optional(),
        role: z.nativeEnum(Role).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session?.user?.id },
      })

      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      /* is user changing self? */
      if (input.id === user.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
      /* is user attempting to give role greater than self? */
      if (input.role && Role[user.role] > Role[input.role]) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      return ctx.prisma.user.update({
        where: {
          id: input.id,
        },
        data: {
          active: input.active,
          role: input.role,
        },
      })
    }),
  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session?.user?.id },
      })

      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      /* is user changing self? */
      if (input.id === user.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      return ctx.prisma.user.delete({
        where: input,
      })
    }),
})
