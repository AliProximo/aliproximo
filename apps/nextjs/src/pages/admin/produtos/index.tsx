import { useState } from "react";
import type { NextPage } from "next";
import Image from "next/image";
// import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { AdminLayout } from "../../../layouts";
import { currencyFormatter, trpc, useFeedback, withAuth } from "../../../utils";

const AdminProducts: NextPage = () => {
  const { data: sessionData } = useSession();
  const [name, setName] = useState<string | undefined>(undefined);
  const { data: allClothings, refetch } = trpc.clothing.all.useQuery(
    {
      storeId: sessionData?.user.storeId,
    },
    {
      enabled: !!sessionData?.user,
    },
  );
  const { Messages /* addFeedback */ } = useFeedback();
  // const router = useRouter();

  const { mutate: create } = trpc.clothing.create.useMutation({
    onSuccess: () => refetch(),
  });

  const { mutate: deleteClothing } = trpc.clothing.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const createClothes = () => {
    if (name && sessionData?.user.storeId) {
      create({ storeId: sessionData?.user.storeId, name });
    }
  };

  return (
    <>
      <AdminLayout>
        <div className="container mt-12 flex flex-col xl:pl-12">
          <h1 className="mb-20 text-2xl font-bold">Lista de Produtos</h1>
          <div className="flex w-full max-w-xs items-end gap-4 md:max-w-md lg:max-w-2xl xl:pl-11">
            <div className="flex flex-1 flex-col">
              <label className="label">
                <span className="label-text">Pesquisar Produtos</span>
              </label>
              <input
                type="text"
                value={name}
                className="input input-md w-full max-w-xs md:max-w-md lg:max-w-xl"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button className="btn btn-outline" onClick={createClothes}>
              Adicionar Produto
            </button>
          </div>
          <div className="mt-4 flex w-full justify-center overflow-x-auto xl:pr-12">
            {allClothings?.length ?? 0 > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Preço (R$)</th>
                    <th>Disponibilidade</th>
                    <th>Editar</th>
                  </tr>
                </thead>
                <tbody>
                  {allClothings?.map((clothing) => (
                    <tr key={clothing.id}>
                      <td>
                        <div className="flex items-center justify-center">
                          {clothing.product.photo ? (
                            <figure className="bg-base-100">
                              <Image
                                src={clothing.product.photo?.url}
                                alt={`${clothing.product.name} logo`}
                                width={100}
                                height={100}
                              />
                            </figure>
                          ) : (
                            <></>
                          )}
                          <span>{clothing.product.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-center">
                          {clothing.product.price &&
                            currencyFormatter(Number(clothing.product.price))}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="toggle"
                            defaultChecked={clothing.product.available}
                          />
                        </div>
                      </td>
                      <td className="grid max-h-min max-w-xs grid-cols-2 grid-rows-2 items-center justify-center gap-4">
                        <button
                          className="btn glass text-base-100 hover:bg-primary bg-neutral col-span-2"
                          onClick={() => deleteClothing({ id: clothing.id })}
                        >
                          Editar Produto
                        </button>
                        <button
                          className="btn glass text-base-100 col-span-2 bg-red-500 hover:bg-red-700"
                          onClick={() => deleteClothing({ id: clothing.id })}
                        >
                          Remover Produto
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <></>
            )}
          </div>
        </div>
      </AdminLayout>
      <div className="toast">{Messages}</div>
    </>
  );
};

export default withAuth(AdminProducts);
