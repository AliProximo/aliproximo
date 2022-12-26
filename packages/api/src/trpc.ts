import type { Role } from "@acme/db";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import { env } from './env/server.mjs'
import { type Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

const has = (roles: Role[]) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    })

    /* NOTE: ADMIN default email has super user capabilities beyond roles */
    if (user?.email === env.ADMIN_EMAIL) {
      return next()
    }

    if (!roles.includes(user?.role ?? 'User')) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return next()
  })

export const createRbacProcedure = ({
  requiredRoles,
}: {
  requiredRoles: Role[]
}) => protectedProcedure.use(has(requiredRoles))
