import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { signIn, signOut } from "next-auth/react";

import { Header } from "../components";
import { trpc } from "../utils/trpc";

// import type { AppRouter } from "@aliproximo/api";
// import type { inferProcedureOutput } from "@trpc/server";
/* const PostCard: React.FC<{
  post: inferProcedureOutput<AppRouter["post"]["all"]>[number];
}> = ({ post }) => {
  return (
    <div className="max-w-2xl rounded-lg border-2 border-gray-500 p-4 transition-all hover:scale-[101%]">
      <h2 className="text-2xl font-bold text-[hsl(280,100%,70%)]">
        {post.title}
      </h2>
      <p>{post.content}</p>
    </div>
  );
}; */

const AuthShowcase: React.FC = () => {
  const { data: session } = trpc.auth.getSession.useQuery();
  const router = useRouter();

  if (session?.user !== undefined) {
    if (session.user.storeId === undefined) {
      router.push("/aberto/loja/cadastro");
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <button
        className="btn-outline btn gap-2"
        onClick={session ? () => signOut() : () => signIn("google")}
      >
        {session ? (
          "SAIR"
        ) : (
          <>
            <Image
              src={"/google-logo.png"}
              width={30}
              height={30}
              alt={"Logo do Google"}
            />
            <span>ENTRAR COM GOOGLE</span>
          </>
        )}
      </button>
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Ali Próximo</title>
        <meta
          name="description"
          content="Descubra o catálogo das lojas físicas mais perto de você"
        />
        <link rel="icon" href="/logo.png" />
      </Head>
      <div className="flex h-screen flex-col">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center bg-white text-black">
          <Image
            src={"/logo.png"}
            width={202}
            height={202}
            alt={"Logo da Ali Próximo"}
          />
          <AuthShowcase />
          {/* <div className="flex h-[60vh] justify-center overflow-y-scroll px-4 text-2xl">
            {postQuery.data ? (
              <div className="flex flex-col gap-4">
                {postQuery.data?.map((p) => {
                  return <PostCard key={p.id} post={p} />;
                })}
              </div>
            ) : (
              <p>Loading..</p>
            )}
          </div> */}
        </main>
      </div>
    </>
  );
};

export default Home;
