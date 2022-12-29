import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { Head, Header } from "../components";

type Props = {
  children?: React.ReactNode;
};

export const AdminLayout: React.FC<Props> = ({ children }) => {
  const [drawerOpen, setDrawer] = useState(false);
  const router = useRouter();
  const { data: sessionData } = useSession();

  return (
    <div className="flex h-screen flex-col">
      <Head title={"AliPróximo - Admin"} />
      <Header className="z-20 col-span-3 max-h-8" />
      <div className="drawer drawer-mobile bg-[#A9A9A9]">
        <input
          id="aside-drawer"
          type="checkbox"
          className="drawer-toggle"
          onChange={() => setDrawer((old) => !old)}
        />
        <div className="drawer-content flex flex-col items-center justify-center">
          {children}
        </div>
        <div className="drawer-side">
          <label htmlFor="aside-drawer" className="drawer-overlay"></label>
          <ul className="menu text-base-content flex w-80 justify-center gap-y-4 bg-[#D9D9D9]">
            {sessionData?.user.role === "Admin" ? (
              <li
                className={`rounded-none ${
                  router.pathname === "/admin/lojas"
                    ? "bg-[#379AC4]"
                    : "bg-[#AAAAAA]"
                }`}
              >
                <Link href={"/admin/lojas"}>
                  <span>Todas as Lojas</span>
                </Link>
              </li>
            ) : (
              <></>
            )}
            <li
              className={`rounded-none ${
                router.pathname === `/admin/loja`
                  ? "bg-[#379AC4]"
                  : "bg-[#AAAAAA]"
              }`}
            >
              <Link href={`/admin/loja`}>
                <span>Dados da Loja</span>
              </Link>
            </li>
            <li
              className={`rounded-none ${
                router.pathname === "/admin/produtos"
                  ? "bg-[#379AC4]"
                  : "bg-[#AAAAAA]"
              }`}
            >
              <Link href={"/admin/produtos"}>
                <span>Produtos</span>
              </Link>
            </li>
            <button className="btn m-4 text-white">Sair</button>
          </ul>
        </div>
      </div>
      <div
        className="tooltip fixed bottom-8 right-8"
        data-tip={`${drawerOpen ? "Fechar" : "Abrir"} Menu`}
      >
        <label
          htmlFor="aside-drawer"
          className={`btn btn-circle swap swap-rotate lg:hidden ${
            drawerOpen ? "swap-active" : ""
          }`}
        >
          <svg
            className="swap-off fill-current"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 512 512"
          >
            <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
          </svg>
          <svg
            className="swap-on fill-current"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 512 512"
          >
            <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
          </svg>
        </label>
      </div>
    </div>
  );
};
