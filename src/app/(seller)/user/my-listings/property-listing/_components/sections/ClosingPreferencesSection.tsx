"use client";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { TextField } from "../form-fields/TextField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "@/icons";
import type { PropertyListingFormValues } from "@/lib/validations/property-listing.schema";
import { CLOSING_DATE_OPTIONS } from "../config/property-type.config";

export function ClosingPreferencesSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<PropertyListingFormValues>();
  const closingDate = useWatch({ control, name: "closingDate" }) ?? "";
  const isSpecificDate = closingDate !== "" && closingDate !== "ASAP";
  const dateValue = closingDate.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? "";

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-2">
        <CalendarIcon  className="text-primary-blue" />
        <h2 className="text-xl font-semibold text-primary-color">
          Closing Preferences
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Title Company"
          placeholder="Preferred Title Co."
          registration={register("titleCompany")}
        />
        <div className="w-full">
          <Label
            htmlFor="closing-date-preference"
            className="mb-1.5 flex items-center gap-1 text-sm font-medium text-primary-black"
          >
            Closing Date <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="closingDate"
            control={control}
            render={({ field }) => (
              <>
                <Select
                  value={isSpecificDate ? "Specific" : field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="closing-date-preference"
                    className={`w-full rounded-md bg-[#F2F4F6] py-5 ${errors.closingDate ? "border-red-400" : "border-[#E2E8F0]"}`}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="p-2">
                    {CLOSING_DATE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="cursor-pointer text-sm"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isSpecificDate && (
                  <Input
                    type="date"
                    value={dateValue}
                    onChange={(event) =>
                      field.onChange(event.target.value || "Specific")
                    }
                    aria-label="Specific closing date"
                    aria-invalid={Boolean(errors.closingDate)}
                    className="mt-2 w-full rounded-md border-[#E2E8F0] bg-[#F2F4F6] py-5"
                  />
                )}
              </>
            )}
          />
          {errors.closingDate?.message && (
            <p className="mt-1 text-xs text-red-500">
              {errors.closingDate.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
