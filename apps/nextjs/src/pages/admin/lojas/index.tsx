import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { AdminLayout } from "../../../layouts";
import { trpc, withAuth } from "../../../utils";

const AdminStores: NextPage = () => {
  const { data: sessionData } = useSession();
  const { data: allStores } = trpc.store.all.useQuery(undefined, {
    enabled: !!sessionData?.user,
  });
  const router = useRouter();

  return (
    <AdminLayout>
      <div className="container flex flex-col items-center">
        <h1 className="mt-12 mb-20 text-2xl font-bold">Lojas Cadastradas</h1>
        <div className="grid grid-cols-1 justify-center gap-4 md:grid-cols-2 xl:grid-cols-3">
          {allStores?.map((store) => (
            <div
              key={store.id}
              className="card md:card-side bg-[#D9D9D9] shadow-xl"
            >
              <figure className="bg-base-100">
                <Image
                  src={store.logo.url}
                  alt={`${store.name} logo`}
                  width={100}
                  height={100}
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{store.name}</h2>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary"
                    onClick={() => router.push(`/admin/lojas/${store.id}`)}
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default withAuth(AdminStores, {
  allowedRoles: ["Admin"],
  replaceUrl: "/admin",
});
