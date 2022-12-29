import Image from "next/image";

type Props = React.HTMLAttributes<HTMLHeadingElement>;

export const Header: React.FC<Props> = ({ className, ...props }) => {
  return (
    <header
      className={`bg-neutral min-h-8 sticky top-0 left-0 z-10 flex flex-col justify-center ${className}`}
      {...props}
    >
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
