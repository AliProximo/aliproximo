import { Address, Photo, Role, Store } from "@aliproximo/db";
import { type DefaultSession,DefaultSession  } from "next-auth";

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
      storeId?: string;
      store?: Store & { logo: Photo } & { address: Address } & { owner: StoreOwner };
    } & DefaultSession["user"];
  }
}
