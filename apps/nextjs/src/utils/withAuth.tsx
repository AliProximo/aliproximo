// eslint-disable-next-line write-good-comments/write-good-comments
/**
 * Original code from Shubham Verma
 * SOURCE: https://blogs.shubhamverma.me/implement-protected-routes-in-nextjs
 */
import type { Role } from "@aliproximo/db";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

type Params = { allowedRoles?: Role[]; replaceUrl?: string };

export const withAuth = (WrappedComponent: NextPage, options?: Params) => {
  const { allowedRoles, replaceUrl } = options ?? ({} as Params);

  return function AuthedWrapper() {
    const Router = useRouter();
    const { status, data: sessionData } = useSession();

    if (typeof window === "undefined") return <WrappedComponent />;

    if (
      status === "unauthenticated" ||
      (allowedRoles &&
        !allowedRoles.includes(sessionData?.user?.role ?? "User"))
    ) {
      Router.replace(replaceUrl ?? "/");
    }

    return <WrappedComponent />;
  };
};
