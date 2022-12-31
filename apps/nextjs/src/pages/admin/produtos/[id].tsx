/* eslint-disable abcsize/abcsize */
import { useState } from "react";
import {
  FieldPath,
  FieldValue,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { AppRouter } from "@aliproximo/api";
import { inputValidators } from "@aliproximo/api/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { inferProcedureInput } from "@trpc/server";
import set from "lodash.set";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { get } from "radash";

import { FileInput, TextInput } from "../../../components";
import { AdminLayout } from "../../../layouts";
import {
  getkeys,
  stringifyQueryParam,
  trpc,
  useAWS,
  useFeedback,
  withAuth,
} from "../../../utils";

type Inputs = inferProcedureInput<AppRouter["clothing"]["update"]> & {
  file: File;
};

const AdminProductById: NextPage = () => {
  const { data: sessionData } = useSession();
  const [fileData, setFile] = useState<File | undefined>(undefined);
  const router = useRouter();
  const id = stringifyQueryParam(router.query.id);
  const { upload } = useAWS();
  const { Messages, addFeedback } = useFeedback();
  const uploadFile = upload({
    successCallback: () => {
      addFeedback("Foto carregada com sucesso");
    },
    errorCallback: () => {
      addFeedback("ERRO: Envio da Foto não concluído");
    },
  });

  const methods = useForm<Inputs>({
    mode: "onBlur",
    resolver: zodResolver(inputValidators["clothing"]["update"]),
  });

  const { data: clothingData, refetch } = trpc.clothing.byId.useQuery(
    {
      id,
    },
    {
      onSuccess: (clothing) => {
        getkeys(clothing)
          .map(
            (path) =>
              [
                path.replace("product.", ""),
                get<FieldValue<Inputs>, string>(clothing, path),
              ] as [FieldPath<Inputs>, string],
          )
          .forEach(([path, value]) => {
            if (value === null) return;
            methods.setValue(path, value);
          });
        methods.setValue("photoFilename", clothing?.product?.photo?.name);
      },
      staleTime: Infinity,
      enabled: id.length > 0,
    },
  );

  const { mutate: update } = trpc.clothing.update.useMutation({
    onSuccess: () => refetch(),
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
    await update({
      ...filteredData,
      photoFilename: remotePath,
      id,
    });
  };

  const fileUrl = fileData
    ? URL.createObjectURL(fileData)
    : clothingData?.product?.photo?.url;

  return (
    <>
      <AdminLayout>
        <div className="container mt-12 flex flex-col justify-center xl:pl-12">
          <h1 className="mb-20 text-2xl font-bold">Informações do produto</h1>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="grid lg:grid-cols-2"
            >
              <TextInput<Inputs> title="Nome do produto" name="name" />
              <TextInput<Inputs>
                title="Quantidade em estoque"
                name="quantity"
              />
              <TextInput<Inputs> title="Preço" name="price" />
              {/*
              TODO: solve later 
              <TextInput<Inputs>
                title="Tamanhos disponíveis (Separe os tamanhos com “;”)"
                name="sizes"
              />
              */}
              <TextInput<Inputs>
                title="Descrição do produto"
                name="description"
                textarea
              />
              <FileInput
                title="Foto"
                url={fileUrl ?? ""}
                name={methods.getValues("photoFilename")}
                accept="image/png, image/jpeg"
                className="file-input file-input-bordered"
                alt="Selecione a foto do produto"
                onChange={(e) => {
                  if (e.target.files !== null && e.target.files.length > 0) {
                    const fileData = e.target.files[0]!; //eslint-disable-line @typescript-eslint/no-non-null-assertion
                    setFile(fileData);
                    methods.setValue("photoFilename", fileData.name);
                  }
                }}
              />
              <input
                type="submit"
                disabled={!methods.formState.isDirty}
                value="Atualizar"
                className="btn btn-wide"
              />
            </form>
          </FormProvider>
        </div>
      </AdminLayout>
      <div className="toast">{Messages}</div>
    </>
  );
};

export default withAuth(AdminProductById);
