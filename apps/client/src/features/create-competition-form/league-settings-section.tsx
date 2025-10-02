// components/features/create-competition-form/league-settings-section.tsx
import { UseFormReturn } from "react-hook-form";
import { MatchType } from "@repo/shared-types";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { convertMatchType } from "../../utils/string";
import { CreateCompetitionFormValues } from "./create-competition-schema";

interface LeagueSettingsSectionProps {
  form: UseFormReturn<CreateCompetitionFormValues>;
}

export function LeagueSettingsSection({ form }: LeagueSettingsSectionProps) {
  return (
    <div className="mt-4 space-y-4 border-l-4 border-accent/30 pl-4">
      <h4 className="font-medium text-accent">League Settings</h4>

      <FormField
        name="numberOfTeams"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Number of Teams (Max 16)</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                min={2}
                className="w-full max-w-xs rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 no-spinner focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2"
              />
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      <FormField
        name="isRoundRobin"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              className="border-accent text-accent"
            />
            <FormLabel>Double Round Robin</FormLabel>
          </FormItem>
        )}
      />

      <FormField
        name="matchType"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
              Match Type
            </FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full max-w-xs rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 sm:px-4 sm:py-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="border-accent/60 bg-panel-bg text-gray-200">
                  {Object.values(MatchType).map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                      className="font-retro hover:bg-accent/20 focus:bg-accent/20 focus:text-white"
                    >
                      {convertMatchType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      <div className="text-sm text-gray-400">
        Teams and fixtures will be created automatically after competition
        setup.
      </div>
    </div>
  );
}
