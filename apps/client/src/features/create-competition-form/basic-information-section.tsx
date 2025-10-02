// components/features/create-competition-form/basic-information-section.tsx
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
            <FormItem className="flex w-full flex-col">
              <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                Competition name
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
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
            <FormItem className="flex w-full flex-col">
              <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                Competition Type
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full max-w-xs rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 sm:px-4 sm:py-2">
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
