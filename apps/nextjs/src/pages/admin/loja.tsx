import { HTMLAttributes, useState } from "react";
import {
  FieldError,
  FieldErrors,
  FieldPath,
  FieldValue,
  FieldValues,
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
} from "react-hook-form";
import type { AppRouter } from "@aliproximo/api";
import { inputValidators } from "@aliproximo/api/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import type { inferProcedureInput } from "@trpc/server";
import set from "lodash.set";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { get } from "radash";

import { AdminLayout } from "../../layouts";
import { trpc, useAWS, useFeedback, withAuth } from "../../utils";

type Inputs = inferProcedureInput<AppRouter["store"]["update"]> & {
  file: File;
};

interface Props<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  title?: string;
}

const TextInput = <T extends FieldValues = FieldValues>({
  name,
  title,
  ...props
}: HTMLAttributes<HTMLInputElement> & Props<T>) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  function getErrorLabel() {
    const error = get<FieldErrors<T>, FieldError>(errors, name);

    if (error === null) return <></>;

    return (
      <label className="label">
        <span className="label-text-alt">{error.message}</span>
      </label>
    );
  }

  return (
    <div className="w-full max-w-xs md:max-w-md">
      <label className="label">
        <span className="label-text">{title ?? name}</span>
      </label>
      <input
        type="text"
        className={`input input-md w-full max-w-xs md:max-w-md ${
          get<FieldErrors<T>, FieldError>(errors, name)
            ? "input-error"
            : "input-bordered"
        }`}
        aria-invalid={errors.registerNumber ? "true" : "false"}
        {...props}
        {...register(name)}
      />
      {getErrorLabel()}
    </div>
  );
};

/* https://stackoverflow.com/questions/32141291/javascript-reflection-get-nested-objects-path */

function isobject(x: unknown) {
  return Object.prototype.toString.call(x) === "[object Object]";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getkeys(obj: any, prefix = "") {
  const keys = Object.keys(obj);
  prefix = prefix ? prefix + "." : "";
  return keys.reduce((result, key) => {
    if (isobject(obj[key])) {
      result = result.concat(getkeys(obj[key], prefix + key));
    } else {
      result.push(prefix + key);
    }
    return result;
  }, [] as string[]);
}

const AdminStore: NextPage = () => {
  const { data: sessionData } = useSession();
  const [fileData, setFile] = useState<File | undefined>(undefined);
  const { Messages, addFeedback } = useFeedback();
  const { upload } = useAWS();
  const uploadFile = upload({
    successCallback: () => {
      addFeedback("Foto carregada com sucesso");
    },
    errorCallback: () => {
      addFeedback("ERRO: Envio da Foto não concluído");
    },
  });

  function removeEmpty(obj: { [index: string]: string | null | undefined }) {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v != null),
    ) as {
      [index: string]: string | undefined;
    };
  }

  const { data: storeData, refetch } = trpc.store.byId.useQuery(
    sessionData?.user.storeId ?? "",
    {
      onSuccess: (store) =>
        getkeys(store)
          .map(
            (path) =>
              [path, get<FieldValue<Inputs>, string>(store, path)] as [
                FieldPath<Inputs>,
                string,
              ],
          )
          .forEach(([path, value]) => {
            if (value !== null) methods.setValue(path, value);
          }),
      placeholderData: sessionData?.user.store,
      staleTime: Infinity,
    },
  );

  const methods = useForm<Inputs>({
    defaultValues: {
      ...storeData,
      address: {
        ...removeEmpty(storeData?.address ?? {}),
      },
      logoFilename: fileData?.name,
    },
    mode: "onBlur",
    resolver: zodResolver(inputValidators["store"]["update"]),
  });

  const { mutate: updateStore } = trpc.store.update.useMutation({
    onError: (error) =>
      addFeedback(`ERRO: Falha ao atualizar loja, ${error.message}`),
    onSuccess: async (store) => {
      addFeedback(`Loja ${store.name} atualizada`);
      refetch();
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    if (sessionData === null) return;

    const filteredData = getkeys(methods.formState.dirtyFields)
      .map((path) => [path, get(data, path)] as [string, unknown])
      .reduce((acc, [path, value]) => {
        set(acc, path, value);
        return acc;
      }, {} as Inputs);

    const remotePath: string | undefined = fileData
      ? `loja/${sessionData.user.id}/${fileData?.name}`
      : undefined;

    await uploadFile({
      file: fileData,
      remotePath: remotePath ?? "",
    });
    await updateStore({
      ...filteredData,
      address: filteredData.address
        ? {
            ...methods.getValues("address"),
            ...filteredData.address,
          }
        : undefined,
      owner: filteredData.owner
        ? {
            ...methods.getValues("owner"),
            ...filteredData.owner,
          }
        : undefined,
      logoFilename: remotePath,
      id: sessionData.user.storeId ?? "",
    });
  };

  return (
    <>
      <AdminLayout>
        <FormProvider {...methods}>
          <form
            className="container mt-auto mb-auto flex flex-1 scroll-m-0 flex-col items-center justify-center"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <div>
              <div className="flex flex-col items-center md:items-start md:px-6">
                <h2 className="text-2xl font-bold">Informações da Loja</h2>
                <h3 className="text-sm">
                  Preencha com os dados do seu negócio
                </h3>
                <div className="form-control container grid grid-cols-1 justify-items-center xl:grid-cols-2 xl:gap-x-6 xl:pl-36">
                  <TextInput<Inputs>
                    name="registerNumber"
                    title={"CNPJ ou CPF"}
                  />
                  <TextInput<Inputs> name="name" title={"Nome"} />
                  <TextInput<Inputs> name="whatsapp" title={"WhatsApp"} />
                  <div className="form-control max-w-xs">
                    <label className="label">
                      <span className="label-text">Logotipo</span>
                    </label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      className="file-input file-input-bordered"
                      alt="Selecione a foto do logotipo"
                      onChange={(e) => {
                        if (
                          e.target.files !== null &&
                          e.target.files.length > 0
                        ) {
                          const fileData = e.target.files[0]!; //eslint-disable-line @typescript-eslint/no-non-null-assertion
                          setFile(fileData);
                          methods.setValue("logoFilename", fileData.name);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-start md:px-6">
                <h2 className="text-2xl font-bold">Endereço</h2>
                <div className="form-control container grid grid-cols-1 justify-items-center md:grid-cols-2 md:gap-x-6 lg:pl-36">
                  <TextInput<Inputs> name="address.postalCode" title={"CEP"} />
                  <TextInput<Inputs>
                    name="address.address"
                    title={"Endereço"}
                  />
                  <TextInput<Inputs>
                    name="address.neighborhood"
                    title={"Bairro"}
                  />
                  <TextInput<Inputs> name="address.state" title={"Estado"} />
                  <TextInput<Inputs> name="address.city" title={"Cidade"} />
                </div>
              </div>
              <div className="flex flex-col items-center md:items-start md:px-6">
                <h2 className="text-xl font-bold lg:text-2xl">
                  Informações do representante legal
                </h2>
                <div className="form-control container grid grid-cols-1 justify-items-center md:grid-cols-2 md:gap-x-6 lg:pl-36">
                  <TextInput<Inputs>
                    name="owner.name"
                    title={"Nome do responsável"}
                  />
                  <TextInput<Inputs>
                    name="owner.email"
                    title={"E-mail do responsável"}
                  />
                  <TextInput<Inputs>
                    name="owner.phone"
                    title={"Celular do responsável"}
                  />
                </div>
              </div>
              <div className="mb-10 mt-6 flex w-full justify-center lg:mb-0">
                <input
                  type="submit"
                  disabled={!methods.formState.isDirty}
                  className="btn-outline btn btn-block text-xl xl:max-w-2xl"
                  value="Atualizar"
                />
              </div>
            </div>
          </form>
        </FormProvider>
      </AdminLayout>
      <div className="toast">{Messages}</div>
    </>
  );
};

export default withAuth(AdminStore);
