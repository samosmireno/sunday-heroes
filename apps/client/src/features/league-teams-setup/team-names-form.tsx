import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Save } from "lucide-react";
import { createTeamNamesSchema, TeamNamesFormData } from "./schemas";
import { CompetitionResponse } from "@repo/shared-types";
import { useMemo } from "react";

interface TeamNamesFormProps {
  competition: CompetitionResponse;
  onSubmit: (data: TeamNamesFormData) => void;
  isSubmitting: boolean;
}

export function TeamNamesForm({
  competition,
  onSubmit,
  isSubmitting,
}: TeamNamesFormProps) {
  const formSchema = createTeamNamesSchema(competition.teams?.length);

  const defaultValues = useMemo(() => {
    const values: Record<string, string> = {};
    competition.teams?.forEach((_, index) => {
      values[`team${index}`] = "";
    });
    return values as TeamNamesFormData;
  }, [competition.teams]);

  const form = useForm<TeamNamesFormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <div className="rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg sm:p-6">
      <div className="mb-4 flex items-center sm:mb-6">
        <h2 className="text-lg font-bold text-accent sm:text-xl">
          Customize Team Names
        </h2>
      </div>

      <div className="mb-6 rounded-lg bg-bg/20 p-4">
        <h3 className="mb-2 text-lg font-medium text-gray-200">
          {competition.name}
        </h3>
        <p className="text-sm text-gray-400">
          Setting up names for teams in your league.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {competition.teams?.map((team, index) => (
              <FormField
                key={`team${index}`}
                name={`team${index}`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-300">
                      Team {index + 1}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={`${team.name || `Name ${index + 1}`}`}
                        className="w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <div className="flex flex-col justify-end gap-2 sm:flex-row">
            <Button
              type="submit"
              disabled={!form.formState.isValid || isSubmitting}
              className="transform rounded-lg border-2 border-accent bg-accent/20 px-4 py-2 text-accent shadow-md transition-all hover:bg-accent/30"
            >
              <Save size={18} className="mr-2" />
              Save Team Names
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
