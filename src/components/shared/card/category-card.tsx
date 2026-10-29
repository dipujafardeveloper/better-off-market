import { ICategory } from "@/types";
import Image from "next/image";
import CCountUp from "../utils/CCountUp";
import Link from "next/link";
import CategoryCount from "./category-count";

export default function CategoryCard({ category }: { category: ICategory }) {
  const { image, title, listingCount } = category;
  return (
    <Link
      href={`/properties-list?propertyType=${title}`}
      className="relative w-full max-h-64 rounded-lg overflow-hidden group "
    >
      <Image
        src={image}
        alt={`${title} category image`}
        width={1200}
        height={1200}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
      <div className="absolute bottom-4 left-4 flex flex-col gap-1">
        <h3 className="text-white xl:text-2xl md:text-xl text-lg font-semibold">
          {title}
        </h3>
        {/* <p className="text-white/80 text-xs font-semibold ">
          {" "}
          <CCountUp end={listingCount} /> listings
        </p> */}
        <CategoryCount title={title} />
      </div>
    </Link>
  );
}
