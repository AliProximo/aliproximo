import type { NextPage } from "next";
import { useSession } from "next-auth/react";

import { AdminLayout } from "../../layouts";
import { withAuth } from "../../utils";

const AdminHome: NextPage = () => {
  const { data: sessionData } = useSession();

  return (
    <AdminLayout>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-3xl">Olá, {sessionData?.user.name}</h1>
        <span className="text-lg">
          Acesse o menu para visualizar suas opções
        </span>
      </div>
    </AdminLayout>
  );
};

export default withAuth(AdminHome);
