import { router } from "../trpc";

import { authRouter } from "./auth";
import { awsRouter } from "./aws";
import { postRouter } from "./post";

export const appRouter = router({
  auth: authRouter,
  aws: awsRouter,
  post: postRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
