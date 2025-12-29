import { UseFormReturn } from "react-hook-form";
import { CompetitionType } from "@repo/shared-types";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { capitalizeFirstLetter } from "../../utils/string";
import { CreateCompetitionFormValues } from "./create-competition-schema";
import { LeagueSettingsSection } from "./league-settings-section";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Info } from "lucide-react";

interface BasicInformationSectionProps {
  form: UseFormReturn<CreateCompetitionFormValues>;
  competitionType: CompetitionType;
}

export function BasicInformationSection({
  form,
  competitionType,
}: BasicInformationSectionProps) {
  return (
    <div>
      <h3 className="mb-3 border-b border-accent/30 pb-2 text-base font-medium text-gray-200 sm:mb-4 sm:text-lg">
        Basic Information
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full max-w-xs flex-col">
              <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                Competition name
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="Sunday Night 5v5"
                  className="w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2"
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full max-w-xs flex-col">
              <FormLabel
                htmlFor="type"
                className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-300"
              >
                Type
                <Popover>
                  <PopoverTrigger asChild>
                    <span className="cursor-pointer hover:text-accent">
                      <Info size={16} aria-label="Competition type info" />
                    </span>
                  </PopoverTrigger>
                  <PopoverContent
                    side="right"
                    className="max-w-52 rounded-lg border-2 border-accent/60 bg-panel-bg p-4 text-sm text-gray-200 shadow-md"
                  >
                    <div>
                      <strong>Duel</strong>
                      <div>Teams and players are mixed every match.</div>
                    </div>
                    <div className="mt-2">
                      <strong>League</strong>
                      <div>
                        Fixed teams compete in a standings-based format.
                      </div>
                    </div>
                    <div className="mt-2">
                      <strong>Knockout</strong>
                      <div>Losing teams are eliminated each round.</div>
                    </div>
                    <div className="mt-2">
                      <strong>
                        ⚠️ Competition type cannot be changed later.
                      </strong>
                    </div>
                  </PopoverContent>
                </Popover>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 sm:px-4 sm:py-2">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="border-accent/60 bg-panel-bg text-gray-200">
                    {Object.values(CompetitionType)
                      .filter((type) => type !== CompetitionType.KNOCKOUT)
                      .map((type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          className="font-retro hover:bg-accent/20 focus:bg-accent/20 focus:text-white"
                        >
                          {capitalizeFirstLetter(type.toString())}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
      </div>

      {competitionType === CompetitionType.LEAGUE && (
        <LeagueSettingsSection form={form} />
      )}
    </div>
  );
}
