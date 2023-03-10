import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { z } from 'zod'

import { env } from '../env/server.mjs'
import { createRbacProcedure, router } from '../trpc'

const awsProcedure = createRbacProcedure({
  requiredRoles: ['Admin', 'Manager', 'Editor', 'User'],
})

export const awsRouter = router({
  getUploadUrl: awsProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const command = new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: input.name,
      })

      return getSignedUrl(ctx.s3Client, command, {
        expiresIn: 3600,
      })
    }),
  getDeleteUrl: awsProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const command = new DeleteObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: input.name,
      })

      return getSignedUrl(ctx.s3Client, command, {
        expiresIn: 3600,
      })
    }),
})
