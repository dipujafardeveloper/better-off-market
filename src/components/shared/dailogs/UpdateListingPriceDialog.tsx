"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wallet, DollarSign, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdatePropertyMutation } from "@/redux/api/propertiesApi";
import { errorModification } from "@/lib/errors/errorModification";
import { toast } from "sonner";
import { LoaderIcon } from "@/icons";
import { revalidateProperties } from "@/lib/actions/revalidate";

const updatePriceSchema = z.object({
  newPrice: z.coerce
    .number({ message: "Price must be a number" })
    .int("Price must be a whole dollar amount")
    .positive("Price must be greater than 0"),
});

type UpdatePriceValues = z.infer<typeof updatePriceSchema>;

interface UpdateListingPriceDialogProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPrice: number;
}

export function UpdateListingPriceDialog({
  open,
  onOpenChange,
  currentPrice,
  id,
}: UpdateListingPriceDialogProps) {
  const [updateProperty, { isLoading }] = useUpdatePropertyMutation();

  const form = useForm<UpdatePriceValues>({
    // @ts-ignore
    resolver: zodResolver(updatePriceSchema),
    defaultValues: {
      newPrice: undefined,
    },
  });

  const handleSubmit = async (values: UpdatePriceValues) => {
    try {
      await updateProperty({
        id,
        formData: {
          oldListingPrice: currentPrice,
          listingPrice: values.newPrice,
        },
      }).unwrap();
      onOpenChange(false);
      await revalidateProperties();
      toast.success("Listing price updated successfully!");
    } catch (error) {
      const errorMessage = errorModification(error);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-105 rounded-lg p-6 overflow-y-auto"
        showCloseButton={false}
      >
        <DialogClose className="absolute right-5 top-5 rounded-sm opacity-70 hover:opacity-100 transition-opacity">
          <X className="size-5 text-primary-black" />
        </DialogClose>

        <DialogHeader className=" text-left">
          <DialogTitle className="text-xl font-semibold text-primary-black">
            Update Listing Price
          </DialogTitle>
          <DialogDescription className="text-[#594139]">
            Adjust the asking price for this property.
          </DialogDescription>
        </DialogHeader>

        <div className=" mt-4">
          <span className="text-sm font-medium text-primary-black">
            Current Price
          </span>
          <div className="flex items-center gap-2 rounded-lg border border-[#F3B896] bg-[#F2F4F6] px-3.5 py-3 mt-2">
            <Wallet className="size-4 text-primary-black" />
            <span className="text-base font-semibold text-primary-black">
              ${currentPrice?.toLocaleString()}
            </span>
          </div>
        </div>

        <Form {...form}>
          {/* @ts-ignore */}
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              // @ts-ignore
              control={form.control}
              name="newPrice"
              render={({ field }) => (
                <FormItem className="mt-4 ">
                  <FormLabel className="text-sm font-medium text-primary-black">
                    New Asking Price
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#1F4E8B]" />
                      <Input
                        {...field}
                        type="number"
                        step="1"
                        min="1"
                        placeholder="0"
                        className="pl-9 border-[#F3B896] focus-visible:ring-[#F3B896]/20 focus-visible:border-[#F3B896] py-6"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="py-5 rounded-md cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#0F2A4D] hover:bg-[#0F2A4D]/90 text-white py-5 rounded-md  cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex gap-1">
                    <LoaderIcon className="animate-spin mt-1" />
                    Updating...
                  </div>
                ) : (
                  "Update Price"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
