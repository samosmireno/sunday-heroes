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
import { Checkbox } from "../../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "../../../lib/utils";
import { Calendar } from "../../ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import FormLayout from "./form-layout";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { MatchType, convertMatchType } from "../../../types/types";
interface AddMatchFormProps {
  isEdited: boolean;
}

export default function AddMatchForm({ isEdited }: AddMatchFormProps) {
  const { form, nextStep, isStepValid } = useMultiStepFormContext();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const hasPenalties = form.watch("match.hasPenalties");

  return (
    <FormLayout title="Match Information">
      <Form {...form}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
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
                <Select
                  name="match_type"
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2">
                      <SelectValue placeholder="Select match type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-accent/60 bg-panel-bg text-gray-200">
                    {Object.values(MatchType).map((matchType) => (
                      <SelectItem
                        key={matchType}
                        value={matchType}
                        className="hover:bg-accent/20 focus:bg-accent/20"
                      >
                        {convertMatchType(matchType)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-400" />
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
                        className="no-spinner w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2"
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
                        className="no-spinner w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <FormField
            name="match.hasPenalties"
            defaultValue={false}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-accent text-accent"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-medium text-gray-300">
                    Include Penalties
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          {hasPenalties && (
            <>
              <div className="col-span-1 sm:col-span-2">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    name="match.penaltyHomeScore"
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col">
                        <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                          Home Team Penalty Score
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            className="no-spinner w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="match.penaltyAwayScore"
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col">
                        <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                          Away Team Penalty Score
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            className="no-spinner w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={isEdited ? undefined : nextStep}
            type={isEdited ? "submit" : "button"}
            className="transform rounded-lg border-2 border-accent bg-accent/20 px-4 py-2 font-bold text-accent shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-accent/30"
            disabled={!isStepValid()}
          >
            {isEdited ? "Save Changes" : "Next"}
          </Button>
        </div>
      </Form>
    </FormLayout>
  );
}
