import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import Header from "../components/ui/header";
import Background from "../components/ui/background";
import Loading from "../components/ui/loading";
import { Save } from "lucide-react";
import axiosInstance from "../config/axios-config";
import { useAuth } from "../context/auth-context";
import { useCompetition } from "../hooks/use-competition";
import { useErrorHandler } from "../hooks/use-error-handler";

const createTeamNamesSchema = (numberOfTeams: number = 0) => {
  const teamFields = Array.from({ length: numberOfTeams }, (_, i) => [
    `team${i}`,
    z
      .string()
      .min(1, `Team ${i + 1} name is required`)
      .max(30, "Team name too long"),
  ]);

  return z.object(Object.fromEntries(teamFields));
};

type TeamNamesFormData = Record<string, string>;

export default function LeagueTeamSetupPage() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { competition, isLoading, refetch } = useCompetition(
    competitionId ?? "",
    user?.id || "",
  );
  const { handleError } = useErrorHandler();

  const formSchema = competition
    ? createTeamNamesSchema(competition.teams?.length)
    : null;

  const form = useForm<TeamNamesFormData>({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
  });

  const onSubmit = async (data: TeamNamesFormData) => {
    if (isSubmitting || !competitionId || !competition?.teams) return;
    setIsSubmitting(true);

    try {
      const teamUpdates = competition.teams.map((team, index) => ({
        id: team.id,
        name: data[`team${index}`] || team.name,
      }));

      await axiosInstance.put(`/api/leagues/${competitionId}/team-names`, {
        teamUpdates,
      });

      await refetch();

      navigate(`/competition/${competitionId}`);
    } catch (error) {
      handleError(error, {
        showToast: true,
        logError: true,
        throwError: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex-1 p-3 sm:p-4 md:p-6">
        <Background />
        <Header title="League Setup" hasSidebar={true} />
        <Loading text="Loading league details..." />
      </div>
    );
  }

  if (!competition || !formSchema) {
    return (
      <div className="relative flex-1 p-3 sm:p-4 md:p-6">
        <Background />
        <Header title="League Setup" hasSidebar={true} />
        <div className="p-6 text-center">
          <p>League not found or invalid data.</p>
          <Button onClick={() => navigate("/competitions")} className="mt-4">
            Back to Competitions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
      <Background />

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col justify-center rounded-lg border-2 border-accent bg-panel-bg p-4 text-center sm:p-6">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent sm:h-12 sm:w-12"></div>
            <p className="text-base font-bold text-accent sm:text-lg">
              Setting up teams...
            </p>
          </div>
        </div>
      )}

      <Header title="League Teams Setup" hasSidebar={true} />

      <div className="relative grid grid-cols-1 gap-4 sm:gap-6">
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
      </div>
    </div>
  );
}
