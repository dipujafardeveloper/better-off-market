"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OfferList from "./OfferList";
import { useState } from "react";
import { useGetMyOffersQuery } from "@/redux/api/offerApi";
import { useSearchParams } from "next/navigation";

export default function OfferListContainer() {
  const [activeTab, setActiveTab] = useState("all");
  const page = useSearchParams().get("page") || "1";
  const limit = useSearchParams().get("limit") || "12";
  const queries: Record<string, string | number> = {};
  if (activeTab === "all") delete queries.status;
  else queries.status = activeTab;

  queries.page = page;
  queries.limit = limit;

  const { data, isLoading } = useGetMyOffersQuery(queries);

  return (
    <div>
      {/* ===========================  tabs  ============================= */}
      <Tabs
        onValueChange={(val) => setActiveTab(val)}
        defaultValue="all"
        className="w-full mt-5"
      >
        <TabsList>
          <TabsTrigger
            value="all"
            className="data-active:bg-primary-color data-active:text-white cursor-pointer px-4 py-3.5 rounded-full mr-1"
          >
            All offers
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-active:bg-primary-color data-active:text-white cursor-pointer px-4 py-3.5 rounded-full mr-1"
          >
            Pending Review
          </TabsTrigger>
          <TabsTrigger
            value="countered"
            className="data-active:bg-primary-color data-active:text-white cursor-pointer px-4 py-3.5 rounded-full mr-1"
          >
            Counter offers
          </TabsTrigger>
          <TabsTrigger
            value="accepted"
            className="data-active:bg-primary-color data-active:text-white cursor-pointer px-4 py-3.5 rounded-full mr-1"
          >
            Accepted
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-active:bg-primary-color data-active:text-white cursor-pointer px-4 py-3.5 rounded-full mr-1"
          >
            Rejected
          </TabsTrigger>
        </TabsList>
        <div className="pt-1  border-b border-b-primary-border-color"></div>
        <TabsContent value="all" className="w-full">
          <OfferList
            data={data}
            page={Number(page)}
            limit={Number(limit)}
            loading={isLoading}
          />
        </TabsContent>
        <TabsContent value="pending">
          <OfferList
            data={data}
            page={Number(page)}
            limit={Number(limit)}
            loading={isLoading}
          />
        </TabsContent>
        <TabsContent value="countered">
          <OfferList
            data={data}
            page={Number(page)}
            limit={Number(limit)}
            loading={isLoading}
          />
        </TabsContent>
        <TabsContent value="accepted">
          <OfferList
            data={data}
            page={Number(page)}
            limit={Number(limit)}
            loading={isLoading}
          />
        </TabsContent>
        <TabsContent value="rejected">
          <OfferList
            data={data}
            page={Number(page)}
            limit={Number(limit)}
            loading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
