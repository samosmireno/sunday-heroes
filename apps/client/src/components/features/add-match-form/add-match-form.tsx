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
import { convertMatchType, MatchType } from "../../../types/types";

interface AddMatchFormProps {
  isEdited: boolean;
}

export default function AddMatchForm({ isEdited }: AddMatchFormProps) {
  const { form, nextStep, isStepValid } = useMultiStepFormContext();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const hasPenalties = form.watch("match.hasPenalties");

  return (
    <FormLayout title="Add match information">
      <Form {...form}>
        <div className="my-8 flex h-full flex-col space-y-6 py-8">
          <FormField
            control={form.control}
            name="match.date"
            render={({ field }) => (
              <FormItem className="flex max-w-max flex-col">
                <FormLabel className="mb-2 font-semibold text-gray-400">
                  Date
                </FormLabel>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                          "border-1 w-60 rounded-md bg-green-100 p-2 focus:outline-none focus:ring-2",
                        )}
                        onClick={() => setPopoverOpen(true)}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      className="border-1 w-60 rounded-md bg-green-100 p-2 focus:outline-none focus:ring-2"
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="match.matchType"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  htmlFor="matchType"
                  className="font-semibold text-gray-400"
                >
                  Match Type
                </FormLabel>
                <FormControl>
                  <Select
                    name="matchType"
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger id="matchType" className="w-60 bg-green-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(MatchType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {convertMatchType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="match.homeTeamScore"
            render={({ field }) => (
              <FormItem className="flex max-w-max flex-col">
                <FormLabel className="mb-2 font-semibold text-gray-400">
                  Home Team Score
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    className="border-1 w-60 rounded-md bg-green-100 p-2 focus:outline-none focus:ring-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="match.awayTeamScore"
            render={({ field }) => (
              <FormItem className="flex max-w-max flex-col">
                <FormLabel className="mb-2 font-semibold text-gray-400">
                  Away Team Score
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    className="border-1 w-60 rounded-md bg-green-100 p-2 focus:outline-none focus:ring-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="match.hasPenalties"
            control={form.control}
            defaultValue={false}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="mb-2 font-semibold text-gray-500">
                    Penalties
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          {hasPenalties && (
            <>
              <FormField
                name="match.penaltyHomeScore"
                render={({ field }) => (
                  <FormItem className="flex max-w-max flex-col">
                    <FormLabel className="mb-2 font-semibold text-gray-400">
                      Home Team Penalty Score
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="border-1 w-60 rounded-md bg-green-100 p-2 focus:outline-none focus:ring-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="match.penaltyAwayScore"
                render={({ field }) => (
                  <FormItem className="flex max-w-max flex-col">
                    <FormLabel className="mb-2 font-semibold text-gray-400">
                      Away Team Penalty Score
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="border-1 w-60 rounded-md bg-green-100 p-2 focus:outline-none focus:ring-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
        <div className="self-end p-10">
          <Button
            className="border-green-300 bg-gradient-to-br from-green-400 to-green-600 transition-all duration-300 ease-linear hover:from-green-400 hover:to-green-800"
            onClick={isEdited ? undefined : nextStep}
            type={isEdited ? "submit" : "button"}
            disabled={!isStepValid()}
          >
            {isEdited ? "Save Changes" : "Next"}
          </Button>
        </div>
      </Form>
    </FormLayout>
  );
}
