import { useMultiStepFormContext } from "../multi-step-form/multi-step-form-context";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "../../../lib/utils";
import { Calendar } from "../../ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import FormLayout from "./form-layout";
import { convertMatchType } from "../../../types/types";

const formatSafeDate = (date: Date): string => {
  if (!date) return "Pick a date";

  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "Pick a date";
    }

    return format(dateObj, "PPP");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Pick a date";
  }
};

export default function MatchDetailsForm() {
  const { form, nextStep, isStepValid } = useMultiStepFormContext();
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <FormLayout title="Match Information">
      <Form {...form}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            name="match.homeTeam"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                  Home Team
                </FormLabel>
                <div className="w-full rounded-lg border-2 border-accent/20 bg-panel-bg/50 px-3 py-1.5 text-gray-200 sm:px-4 sm:py-2">
                  <div className="flex items-center">
                    <span className="font-medium">
                      {field.value || "Home Team"}
                    </span>
                  </div>
                </div>
              </FormItem>
            )}
          />

          <FormField
            name="match.awayTeam"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                  Away Team
                </FormLabel>
                <div className="w-full rounded-lg border-2 border-accent/20 bg-panel-bg/50 px-3 py-1.5 text-gray-200 sm:px-4 sm:py-2">
                  <div className="flex items-center">
                    <span className="font-medium">
                      {field.value || "Away Team"}
                    </span>
                  </div>
                </div>
              </FormItem>
            )}
          />

          <FormField
            name="match.date"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                  Match Date
                </FormLabel>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-left text-gray-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2",
                          !field.value && "text-gray-400",
                        )}
                        onClick={() => setPopoverOpen(true)}
                      >
                        {formatSafeDate(field.value)}
                        <CalendarIcon className="ml-auto h-4 w-4 text-accent/60" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto rounded-lg border-2 border-accent/60 bg-panel-bg p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      className="rounded-lg border-accent/30 bg-panel-bg text-gray-200"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setPopoverOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            name="match.matchType"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                  Match Type
                </FormLabel>
                <div className="w-full rounded-lg border-2 border-accent/20 bg-panel-bg/50 px-3 py-1.5 text-gray-200 sm:px-4 sm:py-2">
                  <div className="flex items-center">
                    <span className="font-medium">
                      {convertMatchType(field.value) || ""}
                    </span>
                  </div>
                </div>
              </FormItem>
            )}
          />
          <div className="col-span-1 sm:col-span-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                name="match.homeTeamScore"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                      Home Team Score
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 no-spinner focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                name="match.awayTeamScore"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                      Away Team Score
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 no-spinner focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={nextStep}
            type={"button"}
            className="transform rounded-lg border-2 border-accent bg-accent/20 px-4 py-2 font-bold text-accent shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-accent/30"
            disabled={!isStepValid()}
          >
            Next
          </Button>
        </div>
      </Form>
    </FormLayout>
  );
}
