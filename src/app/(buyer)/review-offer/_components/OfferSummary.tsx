import { useEffect, useMemo, type ReactNode } from "react";
import {
  FileText,
  AlertCircle,
  Search,
  BadgeCheck,
  Archive,
  Calendar,
  Download,
  MessageSquare,
  MessageSquareText,
} from "lucide-react";
import { SummaryCard } from "./SummaryCard";
import { SummaryField } from "./SummaryField";
import { ContingencyItem } from "./ContingencyItem";
import { Pill } from "./Pill";
import {
  DocIcon,
  DollarIcon,
  PDFIcon,
  PersonalPropertyIcon,
  SellerConcessionsIcon,
} from "@/icons";
import ReadMoreText from "@/components/shared/utils/ReadMoreText";

export interface OfferSummaryData {
  offerAmount: number;
  earnestMoney: number;
  financingType: string;
  financingTerms: string;
  closingCosts: string;

  sellerContribution: number;

  inspection: { required: boolean; days?: number };
  appraisal: { required: boolean; days?: number };

  agent?: { name: string; commission: string };

  personalProperty: {
    included: string[];
    itemsToRemove?: string[];
  };

  closingTerms: {
    titleCompany: string;
    closingDate: string;
    possession: string;
  };

  documents?: File[];
  notesToSeller?: string;
  hasAgent?: boolean;
}

function formatCurrency(amount: number) {
  return amount?.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });
}

function contingencyValue(item: { required: boolean; days?: number }) {
  if (!item.required) return "Waived";
  return item.days ? `Yes, ${item.days} days` : "Yes";
}

interface OfferSummaryProps {
  data: OfferSummaryData;
  /** Extra content rendered at the bottom of the sidebar column (e.g. action buttons). */
  sidebarFooter?: ReactNode;
}

/**
 * Read-only review of a submitted offer. Two-column on large screens
 * (main details left, Documents/Notes sidebar right), single stacked
 * column below `lg`.
 */
export function OfferSummary({ data, sidebarFooter }: OfferSummaryProps) {
  const documentUrls = useMemo(() => {
    return (data?.documents ?? []).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [data?.documents]);

  // Object URLs must be manually revoked, or they leak memory for the
  // lifetime of the page (the browser won't garbage-collect them itself).
  useEffect(() => {
    return () => {
      documentUrls.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [documentUrls]);
  return (
    <div className="mx-auto grid w-full grid-cols-1 gap-6 p-4  sm:p-6 lg:grid-cols-3 lg:items-start border border-[#E6E8EA] md:mt-8 mt-6 rounded-md shadow-[0_10px_30px_0_rgba(15,23,42,0.05)]">
      {/* Main column */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        <SummaryCard title="Offer Details" icon={<DollarIcon />}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <SummaryField
              label="Offer amount"
              value={formatCurrency(data.offerAmount)}
            />
            <SummaryField
              label="Earnest money"
              value={formatCurrency(data.earnestMoney)}
            />
            <SummaryField label="Financing type" value={data.financingType} />
            {data.financingType !== "cash" && (
              <SummaryField
                label="Why not cash, explain terms"
                value={data.financingTerms}
              />
            )}
          </div>
        </SummaryCard>

        <SummaryCard
          title="Seller Concessions"
          icon={<SellerConcessionsIcon />}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <SummaryField label="Closing costs" value={data.closingCosts} />
            <SummaryField
              label="Seller contribution ($)"
              value={formatCurrency(data.sellerContribution)}
            />
          </div>
        </SummaryCard>

        <SummaryCard title="Contingencies" icon={<SellerConcessionsIcon />}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ContingencyItem
              icon={<Search size={16} />}
              label="Inspection"
              value={contingencyValue(data.inspection)}
            />
            <ContingencyItem
              icon={<BadgeCheck size={16} />}
              label="Appraisal"
              value={contingencyValue(data.appraisal)}
            />
          </div>
        </SummaryCard>

        {data?.hasAgent ? (
          <SummaryCard title="Real Estate Agent">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <SummaryField
                label="Agent name"
                value={data?.agent?.name || ""}
              />
              <SummaryField
                label="Commission"
                value={data?.agent?.commission || ""}
              />
            </div>
          </SummaryCard>
        ) : null}

        <SummaryCard title="Personal Property" icon={<PersonalPropertyIcon />}>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#594139]">
                Included items
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data?.personalProperty?.included?.length > 0 ? (
                  data?.personalProperty?.included?.map((item) => (
                    <Pill key={item}>{item}</Pill>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    None specified
                  </span>
                )}
              </div>
            </div>
            {data.personalProperty.itemsToRemove ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#594139]">
                  Items to be removed
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {data?.personalProperty?.itemsToRemove.length > 0 ? (
                    data.personalProperty.itemsToRemove?.map((item) => (
                      <Pill key={item}>{item}</Pill>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      None specified
                    </span>
                  )}
                </div>
                {/* <p className="mt-1 text-sm italic text-primary-black">
                  &ldquo;{data.personalProperty.itemsToRemove}&rdquo;
                </p> */}
              </div>
            ) : null}
          </div>
        </SummaryCard>

        <SummaryCard title="Closing Terms" icon={<Calendar size={18} />}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <SummaryField
              label="Title company"
              value={data.closingTerms.titleCompany}
            />
            <SummaryField
              label="Closing date"
              value={data.closingTerms.closingDate}
            />
            <SummaryField
              label="Possession"
              value={data.closingTerms.possession}
            />
          </div>
        </SummaryCard>
        <div className="hidden lg:flex">{sidebarFooter}</div>
      </div>

      {/* Sidebar column */}
      <div className="flex flex-col gap-6">
        {documentUrls.length > 0 ? (
          <SummaryCard title="Documents" icon={<DocIcon />}>
            <ul className="flex flex-col gap-2">
              {documentUrls.map(({ file, url }, index) => (
                <li key={index}>
                  <a
                    href={url}
                    download={file.name}
                    className="flex items-center justify-between gap-3 rounded-lg border border-primary-border-color bg-[#F7F9FB] px-3 py-3 text-sm text-foreground hover:border-primary/50"
                  >
                    <div className="flex items-center gap-1.5">
                      <PDFIcon className="size-5" />
                      <span className="truncate max-w-64">{file.name}</span>
                    </div>
                    <Download size={16} className="shrink-0 text-[#594139]" />
                  </a>
                </li>
              ))}
            </ul>
          </SummaryCard>
        ) : null}

        {data.notesToSeller ? (
          <SummaryCard
            title="Note to Seller"
            icon={<MessageSquareText color="#00214C" size={20} />}
          >
            <p className="rounded-lg bg-[#F2F4F6] p-3 md:text-base text-sm text-[#594139] italic leading-relaxed">
              <ReadMoreText text={`"${data.notesToSeller}"`} wordLimit={100} />
            </p>
          </SummaryCard>
        ) : null}
        <div className="lg:hidden ">{sidebarFooter}</div>
      </div>
    </div>
  );
}
