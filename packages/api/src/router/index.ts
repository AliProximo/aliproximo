import { router } from "../trpc";

import { authRouter } from "./auth";
import { awsRouter } from "./aws";
import { clothingRouter } from "./clothing";
import { postRouter } from "./post";
import { storeRouter } from "./store";
import { userRouter } from "./user";

export const appRouter = router({
  auth: authRouter,
  aws: awsRouter,
  clothing: clothingRouter,
  post: postRouter,
  store: storeRouter,
  user: userRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
