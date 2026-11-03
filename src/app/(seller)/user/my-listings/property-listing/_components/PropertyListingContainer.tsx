"use client";
import { PropertyListingFormValues } from "@/lib/validations/property-listing.schema";
import { PropertyListingForm } from "./PropertyListingForm";
import { ZodError } from "zod";
import { zodFormErrorModification } from "@/lib/errors/zodFormErrorModification";
import { toast } from "sonner";
import {
  useCreatePropertyMutation,
  useGetSinglePropertyQuery,
  useUpdatePropertyMutation,
} from "@/redux/api/propertiesApi";
import { errorModification } from "@/lib/errors/errorModification";
import { useSearchParams } from "next/navigation";
import SectionTitle from "@/components/shared/titles/SectionTitle";
import { revalidateProperties } from "@/lib/actions/revalidate";

const mapPropertyToFormValues = (
  property: Record<string, any>,
): Partial<PropertyListingFormValues> => ({
  propertyType: property?.propertyType ?? "Residential",
  useType: property?.useType ?? undefined,
  useTypeOther: property?.useTypeOther ?? undefined,
  ownership: property?.ownership ?? "own",
  location: property?.location ?? { type: "Point", coordinates: [0, 0] },
  streetAddress: property?.streetAddress ?? "",
  state: property?.state ?? "",
  county: property?.county ?? "",
  city: property?.city ?? "",
  zipCode: property?.zipCode ?? "",
  parcelIds: property?.parcelIds ?? "",
  listingPrice: property?.listingPrice ?? 0,
  buyItNowPrice: property?.buyItNowPrice ?? undefined,
  arv: property?.arv ?? undefined,
  marketingDescription: property?.marketingDescription ?? "",
  utilities: property?.utilities ?? undefined,
  specifications: property?.specifications ?? {},
  roofMaterial: property?.roofMaterial ?? undefined,
  roofAge: property?.roofAge ?? undefined,
  heatingSystem: property?.heatingSystem ?? undefined,
  heatingAge: property?.heatingAge ?? undefined,
  cooling: property?.cooling ?? undefined,
  coolingAge: property?.coolingAge ?? undefined,
  waterHeating: property?.waterHeating ?? undefined,
  waterHeatingAge: property?.waterHeatingAge ?? undefined,
  water: property?.water ?? undefined,
  sewer: property?.sewer ?? undefined,
  foundation: property?.foundation ?? undefined,
  otherUpdates: property?.otherUpdates ?? undefined,
  roofMaterialOther: property?.roofMaterialOther ?? undefined,
  heatingSystemOther: property?.heatingSystemOther ?? undefined,
  coolingOther: property?.coolingOther ?? undefined,
  waterHeatingOther: property?.waterHeatingOther ?? undefined,
  waterOther: property?.waterOther ?? undefined,
  sewerOther: property?.sewerOther ?? undefined,
  foundationOther: property?.foundationOther ?? undefined,
  hasHoa: property?.hasHoa ?? "no",
  hoaAmount: property?.hoaAmount ?? undefined,
  hoaFrequency: property?.hoaFrequency ?? undefined,
  hoaIncludes: property?.hoaIncludes ?? "",
  titleCompany: property?.titleCompany ?? undefined,
  closingDate: property?.closingDate ?? "",
  photos: Array.isArray(property?.photos) ? property.photos : [],
  documents: Array.isArray(property?.documents)
    ? property.documents.map((doc: any) => doc?.url ?? doc?.name ?? "")
    : [],
});

export default function PropertyListingContainer() {
  const propertyId = useSearchParams().get("property");
  const { data } = useGetSinglePropertyQuery(propertyId, { skip: !propertyId });
  const [createProperty] = useCreatePropertyMutation();
  const [updateProperty] = useUpdatePropertyMutation();

  const defaultValues = data?.data
    ? mapPropertyToFormValues(data.data)
    : undefined;

  const isEditMode = Boolean(propertyId && data?.data);

  const sectionTitleData = isEditMode
    ? {
        title: "Edit Listing",
        description:
          "Update your property details to keep the listing accurate and competitive.",
      }
    : {
        title: "Create new listing",
        description:
          "Provide detailed information to attract high-quality buyers and investors.",
      };

  const handleSubmit = async (values: PropertyListingFormValues) => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(values));

      const uploadedPhotos = values.photos.filter(
        (file): file is File => file instanceof File,
      );
      uploadedPhotos.forEach((file) => formData.append("photos", file));

      const uploadedDocuments = (values.documents ?? []).filter(
        (file): file is File => file instanceof File,
      );
      uploadedDocuments.forEach((file) => formData.append("documents", file));


      if (propertyId && data?.data) {
        await updateProperty({ id: propertyId, formData }).unwrap();
        toast.success("Property updated successfully.");
        await revalidateProperties();
        return true;
      }

      await createProperty(formData).unwrap();
      toast.success(
        "Property Listing request submitted successfully!. Please wait for admin approval. Once approved, your listing will be live on the platform.",
      );
      return true;
    } catch (err) {
      const errMessage = errorModification(err);
      toast.error(errMessage);
    }
  };

  const handleError = (err: ZodError) => {
    const errMessage = zodFormErrorModification(err);
    toast.error(errMessage);
  };

  return (
    <div className="space-y-4">
      <SectionTitle data={sectionTitleData} />
      <PropertyListingForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onError={handleError}
        isEditMode={isEditMode}
      />
    </div>
  );
}
