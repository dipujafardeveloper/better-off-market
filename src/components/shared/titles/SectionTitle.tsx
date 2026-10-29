import { cn } from "@/lib/utils";
import Link from "next/link";

type SectionTitleProps = {
  data: {
    title: string;
    description: string;
    isBtn?: boolean;
    btnLink?: string;
    className?: string;
  };
};

export default function SectionTitle({ data }: SectionTitleProps) {
  return (
    <div className={cn("flex-between gap-1.5", data.className)}>
      <div className="flex-1">
        <h2 className="2xl:text-[32px] xl:text-[28px] text-xl  font-bold">{data.title}</h2>
        <p className="md:text-lg text-[#594139]">{data.description}</p>
      </div>
      {data.isBtn && (
        <Link href={data.btnLink || "#"} >
          <button className="group relative px-8 py-2.5 font-bold text-primary-black transition-all duration-300 ease-in-out hover:text-white hover:shadow-lg hover:shadow-primary-color/40 overflow-hidden border border-[#8D7168] rounded-full active:scale-95 cursor-pointer">
            <span className="absolute inset-0 w-full h-full bg-primary-color scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] origin-left"></span>

            <span className="relative z-10 flex items-center gap-3 tracking-widest text-sm font-medium ">
              Explore All
            </span>
          </button>
        </Link>
      )}
    </div>
  );
}
