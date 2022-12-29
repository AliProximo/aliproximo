import type { NextPage } from "next";
import { useSession } from "next-auth/react";

import { AdminLayout } from "../../layouts";
import { withAuth } from "../../utils";

const AdminHome: NextPage = () => {
  const { data: sessionData } = useSession();

  return (
    <AdminLayout>
      <div className="flex flex-col text-center">
        <h1 className="text-3xl">Olá, {sessionData?.user.name}</h1>
        <span className="text-lg">
          Acesse o menu para visualizar suas opções
        </span>
      </div>
    </AdminLayout>
  );
};

export default withAuth(AdminHome);
