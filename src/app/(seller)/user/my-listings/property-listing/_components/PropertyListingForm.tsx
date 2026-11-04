"use client";
import { useEffect } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  propertyListingSchema,
  type PropertyListingFormValues,
} from "@/lib/validations/property-listing.schema";
import { PropertyTypeSection } from "./sections/PropertyTypeSection";
import { PropertyOwnershipSection } from "./sections/PropertyOwnershipSection";
import { BasicInformationSection } from "./sections/BasicInformationSection";
import { PropertySpecificationsSection } from "./sections/PropertySpecificationsSection";
import { MajorComponentsSection } from "./sections/MajorComponentsSection";
import { HoaInformationSection } from "./sections/HoaInformationSection";
import { ClosingPreferencesSection } from "./sections/ClosingPreferencesSection";
import { PropertyPhotosSection } from "./sections/PropertyPhotosSection";
import { DocumentsSection } from "./sections/DocumentsSection";
import { LoaderIcon } from "@/icons";
import SelectLocationInMap from "./sections/SelectLocationInMap";

interface PropertyListingFormProps {
  defaultValues?: Partial<PropertyListingFormValues>;
  onSubmit: (values: PropertyListingFormValues) => Promise<boolean | void>;
  onError?: (errors: any) => void;
  isEditMode?: boolean;
}

export function PropertyListingForm({
  defaultValues,
  onSubmit,
  onError,
  isEditMode = false,
}: PropertyListingFormProps) {
  const methods = useForm<PropertyListingFormValues>({
    // @ts-ignore
    resolver: zodResolver(propertyListingSchema),
    mode: "onBlur",
    defaultValues: {
      propertyType: "Residential",
      ownership: "own",
      hasHoa: "no",
      photos: [],
      documents: [],
      specifications: {},
      ...defaultValues,
    },
  });

  useEffect(() => {
    methods.reset({
      propertyType: "Residential",
      ownership: "own",
      hasHoa: "no",
      photos: [],
      documents: [],
      specifications: {},
      ...defaultValues,
    });
  }, [defaultValues, methods]);

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;
  const propertyType = useWatch({
    control: methods.control,
    name: "propertyType",
  });

  const handleFormSubmit = async (values: PropertyListingFormValues) => {
    const success = await onSubmit(values);
    if (success) {
      reset();
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        // @ts-ignore
        onSubmit={handleSubmit(handleFormSubmit, onError)}
        className="space-y-6"
      >
        <PropertyTypeSection />
        <PropertyOwnershipSection />
        <BasicInformationSection />
        <SelectLocationInMap />
        <PropertySpecificationsSection />
        {propertyType !== "Land" && <MajorComponentsSection />}
        <HoaInformationSection />
        <ClosingPreferencesSection />
        <PropertyPhotosSection />
        <DocumentsSection />

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="text-sm font-medium text-[#434655] hover:text-gray-700 cursor-pointer"
          >
            Discard Changes
          </button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-color hover:bg-primary-color/90 cursor-pointer px-8 py-5 text-sm font-semibold"
          >
            {isSubmitting ? (
              <div className="flex">
                <span className="mr-2 mt-1">
                  <LoaderIcon />
                </span>
                <span>{isEditMode ? "Updating..." : "Publishing..."}</span>
              </div>
            ) : isEditMode ? (
              "Update Changes"
            ) : (
              "Publish Listing Now"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
