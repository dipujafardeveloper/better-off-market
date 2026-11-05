"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { cn } from "@/lib/utils";
import { useUpdatePropertyMutation } from "@/redux/api/propertiesApi";
import { errorModification } from "@/lib/errors/errorModification";
import { toast } from "sonner";
import { IOpenHouse } from "@/types";
import { revalidateProperties } from "@/lib/actions/revalidate";

const scheduleOpenHouseSchema = z
  .object({
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

type ScheduleOpenHouseValues = z.infer<typeof scheduleOpenHouseSchema>;

interface ScheduleOpenHouseDialogProps {
  id: string;
  openHouse: IOpenHouse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleOpenHouseDialog({
  open,
  onOpenChange,
  id,
  openHouse,
}: ScheduleOpenHouseDialogProps) {
  const [updateProperty, { isLoading }] = useUpdatePropertyMutation();

  const form = useForm<ScheduleOpenHouseValues>({
    resolver: zodResolver(scheduleOpenHouseSchema),
    defaultValues: {
      date: openHouse?.date,
      startTime: openHouse?.startTime,
      endTime: openHouse?.endTime,
    },
  });

  const handleSubmit = async (values: ScheduleOpenHouseValues) => {
    try {
      await updateProperty({
        id,
        formData: {
          openHouse: values,
        },
      }).unwrap();
      onOpenChange(false);
      await revalidateProperties();
      toast.success("Open house scheduled successfully!");
    } catch (error) {
      const errorMessage = errorModification(error);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-115 rounded-lg p-0 gap-0"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between space-y-0 px-6 py-5 border-b border-primary-border-color">
          <DialogTitle className="text-xl font-bold text-primary-black">
            Schedule Open House
          </DialogTitle>
          <DialogClose className="rounded-sm opacity-70 hover:opacity-100 transition-opacity">
            <X className="size-5 text-primary-black" />
          </DialogClose>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="px-6 py-5 space-y-5">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="text-sm font-bold text-primary-black">
                      Open House Date
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        {/* <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary-black" /> */}
                        <Input
                          {...field}
                          type="date"
                          className=" border-[#F3B896] focus-visible:ring-[#1F4E8B]/20 focus-visible:border-[#1F4E8B] py-5"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-primary-black">
                        Start Time
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          {/* <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary-black" /> */}
                          <Input
                            {...field}
                            type="time"
                            className=" border-[#F3B896] focus-visible:ring-[#1F4E8B]/20 focus-visible:border-[#1F4E8B] py-5"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-primary-black">
                        End Time
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          {/* <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary-black" /> */}
                          <Input
                            {...field}
                            type="time"
                            className=" border-[#F3B896] focus-visible:ring-[#1F4E8B]/20 focus-visible:border-[#1F4E8B] py-5"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2.5 rounded-lg bg-[#F2F4F6] border border-[#E2E8F0] p-4">
                <Info className="size-4 text-[#594139] mt-0.5 shrink-0" />
                <p className="text-sm text-[#594139] leading-relaxed">
                  This event will be visible to all potential buyers. RSVP
                  notifications will be sent directly to your dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-primary-border-color bg-[#F2F4F6] rounded-md">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="p-5 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  " bg-primary-color p-5 cursor-pointer",
                  isLoading && "cursor-progress",
                )}
              >
                Schedule Event
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
