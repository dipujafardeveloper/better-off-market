"use client";
import { Controller, useFormContext } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { TextField } from "../form-fields/TextField";
import { SelectField } from "../form-fields/SelectField";
import { TextareaField } from "../form-fields/TextareaField";
import type { PropertyListingFormValues } from "@/lib/validations/property-listing.schema";
import { HOA_FREQUENCY_OPTIONS } from "../config/property-type.config";
import { PeopleIcon } from "@/icons";

export function HoaInformationSection() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<PropertyListingFormValues>();

  const hasHoa = watch("hasHoa");

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-2">
        <PeopleIcon  className="text-primary-blue size-5" />
        <h2 className="text-xl font-semibold text-primary-black">
          HOA Information<span className="text-red-500">*</span>
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <Label className="mb-1.5 block text-sm font-medium text-primary-black">
            HOA?
          </Label>
          <Controller
            name="hasHoa"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex items-center gap-5 pt-1.5"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="hoa-yes" />
                  <Label htmlFor="hoa-yes" className="text-sm font-normal">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="hoa-no" />
                  <Label htmlFor="hoa-no" className="text-sm font-normal">
                    No
                  </Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        <TextField
          label="Amount ($)"
          required={hasHoa === "yes"}
          type="number"
          step="0.01"
          placeholder="0"
          disabled={hasHoa === "no"}
          registration={register("hoaAmount")}
          error={errors.hoaAmount?.message}
        />

        <SelectField
          label="Paid"
          name="hoaFrequency"
          control={control}
          options={HOA_FREQUENCY_OPTIONS}
          required={hasHoa === "yes"}
          disabled={hasHoa === "no"}
          error={errors.hoaFrequency?.message}
        />
      </div>

      <div className="mt-5">
        <TextareaField
          label="Included in HOA"
          rows={2}
          placeholder="Pool, Clubhouse, Landscaping"
          disabled={hasHoa === "no"}
          registration={register("hoaIncludes")}
        />
      </div>
    </section>
  );
}
