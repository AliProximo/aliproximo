/* eslint-disable abcsize/abcsize */
/* eslint-disable complexity */
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import type { AppRouter } from "@aliproximo/api";
import { inputValidators } from "@aliproximo/api/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import type { inferProcedureInput } from "@trpc/server";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { Header } from "../../../components";
import { useModal } from "../../../utils";

type Inputs = inferProcedureInput<AppRouter["store"]["create"]> & {
  file: File;
};

const Home: NextPage = () => {
  const [fileData, setFile] = useState<File | undefined>(undefined);
  const fileUrl = fileData ? URL.createObjectURL(fileData) : undefined;
  const { Modal, open: openModal } = useModal();
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
    setValue,
  } = useForm<Inputs>({
    defaultValues: {
      logoFilename: fileData?.name,
    },
    mode: "onBlur",
    resolver: zodResolver(inputValidators["store"]["create"]),
  });
  const onSubmit: SubmitHandler<Inputs> = (data: Inputs) => {
    console.log({ data }); // eslint-disable-line no-console
    openModal();
  };

  return (
    <div className="flex h-screen flex-col">
      <Head>
        <title>Cadastro Loja - Ali Próximo</title>
        <meta
          name="description"
          content="Descubra o catálogo das lojas físicas mais perto de você"
        />
        <link rel="icon" href="/logo.png" />
      </Head>
      <Header />
      <main className="container flex flex-1 flex-col xl:pl-32">
        <h1 className="flex w-full justify-center pt-12 pb-12 text-3xl font-bold">
          Cadastro de Loja
        </h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full flex-col"
        >
          <div className="flex flex-col items-center md:items-start md:px-6">
            <h2 className="text-2xl font-bold">Informações da Loja</h2>
            <h3 className="text-sm">Preencha com os dados do seu negócio</h3>
            <div className="form-control container grid grid-cols-1 justify-items-center md:grid-cols-2 md:gap-x-6 lg:pl-36">
              <div className="w-full max-w-xs md:max-w-md">
                <label className="label">
                  <span className="label-text">CNPJ ou CPF</span>
                </label>
                <input
                  type="text"
                  className={`input-bordered input input-md w-full max-w-xs md:max-w-md ${
                    errors.registerNumber ? "input-error" : "border-black"
                  }`}
                  aria-invalid={errors.registerNumber ? "true" : "false"}
                  {...register("registerNumber")}
                />
                {errors.registerNumber && (
                  <label className="label">
                    <span className="label-text-alt">
                      {errors.registerNumber.message}
                    </span>
                  </label>
                )}
              </div>
              <div className="w-full max-w-xs md:max-w-md">
                <label className="label">
                  <span className="label-text">
                    Nome da loja (como aparecerá no app)
                  </span>
                </label>
                <input
                  type="text"
                  className={`input-bordered input input-md w-full max-w-xs md:max-w-md ${
                    errors.name ? "input-error" : "border-black"
                  }`}
                  aria-invalid={errors.name ? "true" : "false"}
                  {...register("name")}
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt">
                      {errors.name.message}
                    </span>
                  </label>
                )}
              </div>
              <div className="w-full max-w-xs md:max-w-md">
                <label className="label">
                  <span className="label-text">WhatsApp</span>
                </label>
                <input
                  type="text"
                  className={`input-bordered input input-md w-full max-w-xs md:max-w-md ${
                    errors.whatsapp ? "input-error" : "border-black"
                  }`}
                  aria-invalid={errors.whatsapp ? "true" : "false"}
                  {...register("whatsapp")}
                />
                {errors.whatsapp && (
                  <label className="label">
                    <span className="label-text-alt">
                      {errors.whatsapp.message}
                    </span>
                  </label>
                )}
              </div>
              <div className="w-full max-w-xs md:max-w-md">
                <label className="label">
                  <span className="label-text">Categoria da Loja</span>
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Em Breve"
                  className="input-bordered input input-md w-full max-w-xs border-black md:max-w-md"
                />
              </div>
              <div className="indicator m-8">
                <div className={`indicator-item ${!fileData ? "hidden" : ""}`}>
                  <button
                    className="btn-ghost btn-square btn text-base-100 bg-red-500"
                    onClick={() => setFile(undefined)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <label
                  className="flex h-20 w-64 cursor-pointer items-center justify-center rounded border border-solid border-black object-cover text-lg"
                  htmlFor="add-single-img"
                >
                  {fileUrl ? (
                    <Image
                      src={fileUrl}
                      alt="Imagem selecionada para categoria"
                      width={256}
                      height={64}
                      className="rounded"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Logotipo
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="#000000"
                        viewBox="0 0 256 256"
                      >
                        <rect width="256" height="256" fill="none"></rect>
                        <path
                          d="M208,208H48a16,16,0,0,1-16-16V80A16,16,0,0,1,48,64H80L96,40h64l16,24h32a16,16,0,0,1,16,16V192A16,16,0,0,1,208,208Z"
                          fill="none"
                          stroke="#000000"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="16"
                        ></path>
                        <circle
                          cx="128"
                          cy="132"
                          r="36"
                          fill="none"
                          stroke="#000000"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="16"
                        ></circle>
                      </svg>
                    </div>
                  )}
                </label>
              </div>
              <input
                type="file"
                id="add-single-img"
                accept="image/png, image/jpeg"
                className="hidden"
                alt="Selecione a foto do logotipo"
                onChange={(e) => {
                  if (e.target.files !== null && e.target.files.length > 0) {
                    const fileData = e.target.files[0]!; //eslint-disable-line @typescript-eslint/no-non-null-assertion
                    setFile(fileData);
                    setValue("logoFilename", fileData.name);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex flex-col items-center md:items-start md:px-6">
            <h2 className="text-2xl font-bold">Endereço</h2>
            <div className="form-control container grid grid-cols-1 justify-items-center md:grid-cols-2 md:gap-x-6 lg:pl-36">
              <div className="w-full max-w-xs md:max-w-md">
                <label className="label">
                  <span className="label-text">CEP</span>
                </label>
                <input
                  type="text"
                  className={`input-bordered input input-md w-full max-w-xs md:max-w-md ${
                    errors.address?.postalCode ? "input-error" : "border-black"
                  }`}
                  aria-invalid={errors.address?.postalCode ? "true" : "false"}
                  {...register("address.postalCode")}
                />
                {errors.address?.postalCode && (
                  <label className="label">
                    <span className="label-text-alt">
                      {errors.address?.postalCode.message}
                    </span>
                  </label>
                )}
              </div>
              <div className="w-full max-w-xs md:max-w-md">
                <label className="label">
                  <span className="label-text">Endereço</span>
                </label>
                <input
                  type="text"
                  className={`input-bordered input input-md w-full max-w-xs md:max-w-md ${
                    errors.address?.address ? "input-error" : "border-black"
                  }`}
                  aria-invalid={errors.address?.address ? "true" : "false"}
                  {...register("address.address")}
                />
                {errors.address?.address && (
                  <label className="label">
                    <span className="label-text-alt">
                      {errors.address?.address.message}
                    </span>
                  </label>
                )}
              </div>
              <div className="w-full max-w-xs md:max-w-md">
                <label className="label">
                  <span className="label-text">Bairro</span>
                </label>
                <input
                  type="text"
                  className={`input-bordered input input-md w-full max-w-xs md:max-w-md ${
                    errors.address?.neighborhood
                      ? "input-error"
                      : "border-black"
                  }`}
                  aria-invalid={errors.address?.neighborhood ? "true" : "false"}
                  {...register("address.neighborhood")}
                />
                {errors.address?.neighborhood && (
                  <label className="label">
                    <span className="label-text-alt">
                      {errors.address?.neighborhood.message}
                    </span>
                  </label>
                )}
              </div>
              <div className="w-full max-w-xs md:max-w-md">
                <label className="label">
                  <span className="label-text">Estado</span>
                </label>
                <input
                  type="text"
                  className={`input-bordered input input-md w-full max-w-xs md:max-w-md ${
                    errors.address?.state ? "input-error" : "border-black"
                  }`}
                  aria-invalid={errors.address?.state ? "true" : "false"}
                  {...register("address.state")}
                />
                {errors.address?.state && (
                  <label className="label">
                    <span className="label-text-alt">
                      {errors.address?.state.message}
                    </span>
                  </label>
                )}
              </div>
              <div className="w-full max-w-xs md:max-w-md">
                <label className="label">
                  <span className="label-text">Cidade</span>
                </label>
                <input
                  type="text"
                  className={`input-bordered input input-md w-full max-w-xs md:max-w-md ${
                    errors.address?.city ? "input-error" : "border-black"
                  }`}
                  aria-invalid={errors.address?.city ? "true" : "false"}
                  {...register("address.city")}
                />
                {errors.address?.city && (
                  <label className="label">
                    <span className="label-text-alt">
                      {errors.address?.city.message}
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center pt-6 md:items-start md:px-6">
            <h2 className="text-xl font-bold lg:text-2xl">
              Informações do representante legal
            </h2>
            <div className="form-control container grid grid-cols-1 justify-items-center md:grid-cols-2 md:gap-x-6 lg:pl-36">
              <div className="w-full max-w-xs md:max-w-md">
                <label className="label">
                  <span className="label-text">Nome do responsável</span>
                </label>
                <input
                  type="text"
                  className={`input-bordered input input-md w-full max-w-xs md:max-w-md ${
                    errors.owner?.name ? "input-error" : "border-black"
                  }`}
                  aria-invalid={errors.owner?.name ? "true" : "false"}
                  {...register("owner.name")}
                />
                {errors.owner?.name && (
                  <label className="label">
                    <span className="label-text-alt">
                      {errors.owner?.name.message}
                    </span>
                  </label>
                )}
              </div>
              <div className="w-full max-w-xs md:max-w-md">
                <label className="label">
                  <span className="label-text">E-mail do responsável</span>
                </label>
                <input
                  type="text"
                  className={`input-bordered input input-md w-full max-w-xs md:max-w-md ${
                    errors.owner?.email ? "input-error" : "border-black"
                  }`}
                  aria-invalid={errors.owner?.email ? "true" : "false"}
                  id="email"
                  {...register("owner.email")}
                />
                {errors.owner?.email && (
                  <label className="label">
                    <span className="label-text-alt">
                      {errors.owner?.email.message}
                    </span>
                  </label>
                )}
              </div>
              <div className="w-full max-w-xs md:max-w-md">
                <label className="label">
                  <span className="label-text">Celular do responsável</span>
                </label>
                <input
                  type="text"
                  className={`input-bordered input input-md w-full max-w-xs md:max-w-md ${
                    errors.owner?.phone ? "input-error" : "border-black"
                  }`}
                  aria-invalid={errors.owner?.phone ? "true" : "false"}
                  {...register("owner.phone")}
                />
                {errors.owner?.phone && (
                  <label className="label">
                    <span className="label-text-alt">
                      {errors.owner?.phone.message}
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>
          <span className="flex w-full justify-center p-6 text-center">
            Ao clicar em Cadastrar, você concorda com nossos Termos e Política
            de Privacidade.
          </span>
          <div className="flex w-full justify-center xl:pb-6">
            <input
              type="submit"
              disabled={!isValid}
              className="btn-outline btn btn-block text-xl xl:max-w-2xl"
              value="Cadastrar"
            />
          </div>
        </form>
      </main>
      <Modal>
        <div className="flex w-full flex-col items-center pt-12 pb-12">
          <Image
            src={"/logo.png"}
            width={128}
            height={128}
            alt={"Logo da Ali Próximo"}
          />
          <h1 className="pt-12 pb-12 text-3xl font-bold">
            Informações enviadas
          </h1>
          <span className="text-center text-xl">
            Seu cadastro será analisado e, se estiver tudo certo, uma resposta
            vai ser enviada para o seu e-mail cadastrado
          </span>
        </div>
      </Modal>
    </div>
  );
};

export default Home;
