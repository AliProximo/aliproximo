import { router } from "../trpc";

import { authRouter } from "./auth";
import { awsRouter } from "./aws";
import { clothingRouter } from "./clothing";
import { postRouter } from "./post";
import { storeInputValidators,storeRouter } from "./store";
import { userRouter } from "./user";

export const appRouter = router({
  auth: authRouter,
  aws: awsRouter,
  clothing: clothingRouter,
  post: postRouter,
  store: storeRouter,
  user: userRouter
});

export const inputValidators = {
  'store': storeInputValidators
}

// export type definition of API
export type AppRouter = typeof appRouter;
