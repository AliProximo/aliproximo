import { HTMLAttributes, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { Head, Header } from "../components";

type Props = {
  children?: React.ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export const AdminLayout: React.FC<Props> = ({
  children,
  className,
  ...props
}) => {
  const [drawerOpen, setDrawer] = useState(false);
  const router = useRouter();
  const { data: sessionData } = useSession();

  return (
    <div className="flex h-screen flex-col">
      <Head title={"AliPróximo - Admin"} />
      <Header className="z-20 col-span-3 max-h-8" />
      <div className="drawer drawer-mobile">
        <input
          id="aside-drawer"
          type="checkbox"
          className="drawer-toggle"
          onChange={() => setDrawer((old) => !old)}
        />
        <div
          className={`drawer-content flex bg-[#F5F5F5] ${className}`}
          {...props}
        >
          {children}
        </div>
        <div className="drawer-side">
          <label htmlFor="aside-drawer" className="drawer-overlay"></label>
          <div className="menu text-base-content flex w-40 flex-col justify-center bg-[#D9D9D9] md:w-80">
            {sessionData?.user.store && (
              <figure className="bg-base-100 mb-12 flex h-[100px] w-[100px] justify-center self-center border border-black">
                <Image
                  src={sessionData?.user.store.logo.url}
                  alt={`logo da empresa ${sessionData?.user.store.name}`}
                  width={100}
                  height={100}
                />
              </figure>
            )}
            <ul className="flex flex-col gap-y-4">
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
            </ul>
            <button className="btn m-4 text-white">Sair</button>
          </div>
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
