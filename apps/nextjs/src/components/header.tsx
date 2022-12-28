import Image from "next/image";

export const Header: React.FC = () => {
  return (
    <header className="bg-neutral min-h-8 sticky top-0 left-0 z-10 flex flex-col justify-center">
      <Image
        className="ml-12"
        src={"/brand.png"}
        alt="AliPróximo"
        width={131}
        height={20}
      />
    </header>
  );
};
