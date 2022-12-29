import NextHead from "next/head";

type Props = {
  title?: string;
  description?: string;
};

export const Head: React.FC<Props> = ({ title, description }) => {
  const defaultProps = {
    title: "Ali Próximo",
    description: "aproximando os clientes da sua história",
  } as Props;

  return (
    <NextHead>
      <title>{title ?? defaultProps.title}</title>
      <meta
        name="description"
        content={description ?? defaultProps.description}
      />
      <link rel="icon" href="/logo.png" />
    </NextHead>
  );
};
