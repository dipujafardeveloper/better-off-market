"use client";

import { useGetPropertyTypeCountsQuery } from "@/redux/api/propertiesApi";
import CCountUp from "../utils/CCountUp";
import { Skeleton } from "@/components/ui/skeleton";

const listingCount = (title: string, data: Record<string, number>) => {
  return data?.[title] || 0;
};

export default function CategoryCount({ title }: { title: string }) {
  const { data, isLoading } = useGetPropertyTypeCountsQuery(undefined);

  if (isLoading) return <Skeleton className="h-5 w-16" />;
  return (
    <p className="text-white/80 text-xs font-semibold ">
      {" "}
      <CCountUp end={listingCount(title, data?.data)} /> listings
    </p>
  );
}
