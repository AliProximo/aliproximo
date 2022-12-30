import { Prisma, SizeOptions } from "@aliproximo/db";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import isDecimal from "validator/lib/isDecimal";
import { z } from "zod";

import { formatAWSfileUrl } from "../common";
import { env } from "../env/server.mjs";
import { createRbacProcedure, publicProcedure, router } from "../trpc";

export const clothingProcedure = createRbacProcedure({
  requiredRoles: ["Admin", "Editor"],
});

export const clothingRouter = router({
  all: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
        categoryId: z.string().cuid().optional(),
        storeId: z.string().cuid().optional(),
        sizes: z.nativeEnum(SizeOptions).array().optional(),
        take: z.number().gte(0).optional(),
        skip: z.number().gte(0).optional(),
        orderBy: z
          .object({
            price: z.enum(["asc", "desc"]),
          })
          .optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.clothing.findMany({
        where:
          input.name || input.categoryId || input.storeId || input.sizes
            ? {
                product: {
                  name: input.name ? { contains: input.name } : undefined,
                  categoryId: input.categoryId
                    ? {
                        equals: input.categoryId,
                      }
                    : undefined,
                },
                storeId: input.storeId
                  ? {
                      equals: input.storeId,
                    }
                  : undefined,
                sizes: input.sizes
                  ? {
                      some: {
                        name: {
                          in: input.sizes,
                        },
                      },
                    }
                  : undefined,
              }
            : undefined,
        include: {
          sizes: true,
          product: {
            include: {
              category: true,
              photo: true,
            },
          },
        },
        take: input.take,
        skip: input.skip,
        orderBy: input.orderBy
          ? {
              product: input.orderBy,
            }
          : undefined,
      });
    }),
  byId: publicProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.clothing.findUnique({
        where: input,
        include: {
          sizes: true,
          product: {
            include: {
              category: true,
              photo: true,
            },
          },
        },
      });
    }),
  create: clothingProcedure
    .input(
      z.object({
        sizes: z.nativeEnum(SizeOptions).array().optional(),
        storeId: z.string().cuid(),
        // product data
        name: z.string(),
        quantity: z.number().int().optional(),
        description: z.string().optional(),
        price: z
          .string()
          .refine(
            (value) =>
              isDecimal(value, {
                decimal_digits: "1,3",
                locale: "pt-BR",
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
      }),
    )
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
        if (input.storeId !== user.storeId) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
      }

      const { sizes, storeId, price, category, photoFilename, ...rest } = input;

      return ctx.prisma.clothing.create({
        data: {
          sizes: sizes
            ? {
                connectOrCreate: sizes.map((size) => ({
                  where: { name: size },
                  create: { name: size },
                })),
              }
            : undefined,
          store: {
            connect: {
              id: storeId,
            },
          },
          product: {
            create: {
              ...rest,
              price: price ? new Prisma.Decimal(price) : undefined,
              category: category
                ? category.name
                  ? {
                      create: {
                        name: category.name,
                      },
                    }
                  : {
                      connect: {
                        id: category.id,
                      },
                    }
                : undefined,
              photo: photoFilename
                ? {
                    create: {
                      name: photoFilename,
                      url: formatAWSfileUrl(photoFilename),
                    },
                  }
                : undefined,
            },
          },
        },
        include: {
          sizes: true,
          product: {
            include: {
              category: true,
              photo: true,
            },
          },
        },
      });
    }),
  update: clothingProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        sizes: z.nativeEnum(SizeOptions).array().optional(),
        // product data
        name: z.string().optional(),
        quantity: z.number().int().gte(0).optional(),
        description: z.string().optional(),
        price: z
          .string()
          .refine(
            (value) =>
              isDecimal(value, {
                decimal_digits: "1,3",
                locale: "pt-BR",
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const clothing = await ctx.prisma.clothing.findUnique({
        where: { id: input.id },
        include: {
          sizes: true,
          product: {
            include: {
              category: true,
              photo: true,
            },
          },
        },
      });

      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session?.user?.id },
      });

      if (user === null) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      /* is user default admin? skip validations */
      if (user?.email !== env.ADMIN_EMAIL) {
        /* is user changing another store? */
        if (clothing?.storeId !== user.storeId) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
      }

      if (clothing === null) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      function getDeletePromise({
        photo,
        key,
      }: {
        photo: string | undefined;
        key: string | undefined;
      }) {
        if (photo === undefined || key === undefined)
          return new Promise<void>((resolve) => resolve());

        const command = new DeleteObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Key: key,
        });

        return ctx.s3Client.send(command);
      }
      const {
        id: _,
        photoFilename,
        sizes,
        price,
        category,
        ...productData
      } = input;

      return getDeletePromise({
        photo: photoFilename,
        key: clothing.product.photo?.name,
      })
        .then(() =>
          ctx.prisma.product.update({
            where: { id: clothing.productId },
            data: {
              ...productData,
              price: price ? new Prisma.Decimal(price) : undefined,
              category: category
                ? category.name
                  ? {
                      create: {
                        name: category.name,
                      },
                    }
                  : {
                      connect: {
                        id: category.id,
                      },
                    }
                : undefined,
              photo: photoFilename
                ? {
                    create: {
                      name: photoFilename,
                      url: formatAWSfileUrl(photoFilename),
                    },
                  }
                : undefined,
            },
          }),
        )
        .then(() =>
          ctx.prisma.clothing.update({
            where: { id: clothing.id },
            data: {
              sizes: sizes
                ? {
                    connectOrCreate: sizes.map((size) => ({
                      where: { name: size },
                      create: { name: size },
                    })),
                  }
                : undefined,
            },
            include: {
              sizes: true,
              product: {
                include: {
                  category: true,
                  photo: true,
                },
              },
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
  delete: clothingProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const clothing = await ctx.prisma.clothing.findUnique({
        where: { id: input.id },
        include: {
          sizes: true,
          product: {
            include: {
              category: true,
              photo: true,
            },
          },
        },
      });

      if (clothing === null) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      function getDeletePromise({ key }: { key: string | undefined }) {
        if (key === undefined) return new Promise<void>((resolve) => resolve());

        const command = new DeleteObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Key: key,
        });

        return ctx.s3Client.send(command);
      }

      // TODO: review relations to use more referential actions, instead of code
      // https://www.prisma.io/docs/concepts/components/prisma-schema/relations/referential-actions
      // TODO: use prisma transaction, if needed, instead of 3 separated promises
      // https://www.prisma.io/docs/concepts/components/prisma-client/transactions#sequential-prisma-client-operations
      return getDeletePromise({
        key: clothing.product.photo?.name,
      })
        .then(() => {
          if (clothing.product.photoId) {
            ctx.prisma.photo.delete({
              where: { id: clothing.product.photoId },
            });
          }
        })
        .then(() => {
          if (clothing.product.id) {
            ctx.prisma.product.delete({
              where: {
                id: clothing.product.id,
              },
            });
          }
        })
        .then(() =>
          ctx.prisma.clothing.delete({
            where: { id: clothing.id },
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
