import { Role } from "@aliproximo/db";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { formatAWSfileUrl } from "../common";
import { env } from "../env/server.mjs";
import {
  createRbacProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../trpc";
import { storeInputValidators } from "../validators/input/store";

const storeProcedure = createRbacProcedure({
  requiredRoles: ["Admin", "Manager"],
});
const adminProcedure = createRbacProcedure({ requiredRoles: ["Admin"] });

const isAdmin = (user?: { email?: string | null; role: Role }) =>
  user?.email === env.ADMIN_EMAIL || user?.role === "Admin";

export const storeRouter = router({
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.store.findMany({
      where: !isAdmin(ctx.session?.user)
        ? { verified: { equals: true } }
        : undefined,
      include: { logo: true },
    });
  }),
  byId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.store.findUnique({
      where: { id: input },
      include: { logo: true, address: true, owner: true },
    });
  }),
  create: protectedProcedure
    .input(storeInputValidators["create"])
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session?.user?.id },
      });

      if (user === null) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      /* is user default admin? skip validations */
      if (user.email !== env.ADMIN_EMAIL) {
        /* does user belong to a store? */
        if (user.storeId !== null) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
      }

      const isTrustedSource = (() => {
        if (user.email === env.ADMIN_EMAIL) return true;
        if ((["Admin", "Manager"] as Role[]).includes(user.role)) return true;
        return false;
      })();

      const { address, logoFilename, owner, ...rest } = input;
      return ctx.prisma.store.create({
        data: {
          ...rest,
          users: {
            connect: {
              id: user.id,
            },
          },
          logo: {
            create: {
              name: logoFilename,
              url: formatAWSfileUrl(logoFilename),
            },
          },
          owner: {
            connectOrCreate: {
              where: { email: owner.email },
              create: owner,
            },
          },
          address: {
            connectOrCreate: {
              where: {
                postalCode: address.postalCode,
              },
              create: address,
            },
          },
          verified: isTrustedSource,
        },
      });
    }),
  update: storeProcedure
    .input(storeInputValidators["update"])
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session?.user?.id },
      });

      if (user === null) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      /* is user default admin? skip validations */
      if (user?.email !== env.ADMIN_EMAIL) {
        /* is user changing another store? */
        if (input.id !== user.storeId) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
      }

      const store = await ctx.prisma.store.findUnique({
        where: { id: input.id },
        include: { logo: true },
      });

      if (store === null) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      function getDeletePromise({
        photo,
        key,
      }: {
        photo: string | undefined;
        key: string;
      }) {
        if (photo === undefined)
          return new Promise<void>((resolve) => resolve());

        const command = new DeleteObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Key: key,
        });

        return ctx.s3Client.send(command);
      }

      const { id, address, logoFilename, owner, ...rest } = input;

      return getDeletePromise({
        photo: logoFilename,
        key: store.logo.name,
      })
        .then(() =>
          ctx.prisma.store.update({
            where: { id },
            data: {
              ...rest,
              logo: logoFilename
                ? {
                    create: {
                      name: logoFilename,
                      url: formatAWSfileUrl(logoFilename),
                    },
                  }
                : undefined,
              owner: owner
                ? {
                    connectOrCreate: {
                      where: { email: owner.email },
                      create: owner,
                    },
                  }
                : undefined,
              address: address
                ? {
                    connectOrCreate: {
                      where: {
                        postalCode: address.postalCode,
                      },
                      create: address,
                    },
                  }
                : undefined,
            },
            include: {
              logo: true,
              address: true,
              owner: true,
            },
          }),
        )
        .catch((error) => {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: (error as Error).message,
          });
        });
    }),
  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session?.user?.id },
      });

      if (user === null) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      /* is user default admin? skip validations */
      if (user?.email !== env.ADMIN_EMAIL) {
        /* is user changing another store? */
        if (input.id !== user.storeId) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
      }

      const store = await ctx.prisma.store.findUnique({
        where: input,
        include: {
          logo: true,
        },
      });

      if (store === null) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const command = new DeleteObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: store.logo.name,
      });

      return ctx.s3Client
        .send(command)
        .then(() =>
          ctx.prisma.store.delete({
            where: input,
          }),
        )
        .catch((error) => {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: (error as Error).message,
          });
        });
    }),
});
