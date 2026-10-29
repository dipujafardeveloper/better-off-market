"use client";

import { Skeleton } from "@/components/ui/skeleton";
import useGreeting from "@/hooks/useGreeting";
import { useGetMyProfileQuery } from "@/redux/api/profileApi";


export default function GreetingMessage() {
  const { data, isLoading } = useGetMyProfileQuery(undefined);
  const greeting = useGreeting();
  return (
    <h4 className="md:text-[30px] text-xl font-semibold text-primary-black">
      {greeting}, <span>{isLoading ? <Skeleton className="w-40 h-6 inline-flex bg-gray-200" /> : data?.data?.name?.split(" ")[0]}</span>
    </h4>
  );
}
