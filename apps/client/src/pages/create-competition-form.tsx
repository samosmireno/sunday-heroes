import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CreateCompetitionFormSchema,
  CreateCompetitionFormValues,
} from "../components/features/create-competition-form/create-competition-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompetitionType, MatchType } from "@repo/shared-types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { capitalizeFirstLetter } from "../utils/utils";
import { Checkbox } from "../components/ui/checkbox";
import { Info, Save, Trophy } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { transformCompetitionFormToRequest } from "../utils/transform";
import { useParams } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import { GuideBox } from "../components/ui/guide-box";
import { InfoBox } from "../components/ui/info-box";
import Header from "../components/ui/header";
import { convertMatchType } from "../types/types";

const CreateCompetitionForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<CreateCompetitionFormValues>({
    resolver: zodResolver(CreateCompetitionFormSchema),
    defaultValues: {
      track_seasons: false,
      voting_enabled: false,
    },
  });
  const navigate = useNavigate();
  const { userId } = useParams() as { userId: string };

  const votingEnabled: boolean = form.watch("voting_enabled");
  const competitionType: CompetitionType = form.watch("type");

  async function onSubmit(values: CreateCompetitionFormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!userId) {
      setIsSubmitting(false);
      return;
    }
    const reqData = transformCompetitionFormToRequest(values, userId);
    try {
      if (values.type !== CompetitionType.LEAGUE) {
        await axiosInstance.post(`/api/competitions`, reqData);
        navigate(-1);
      } else {
        const response = await axiosInstance.post(`/api/leagues`, reqData);
        navigate(`/league-setup/${response.data.competition.id}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (votingEnabled === false) {
      form.setValue("voting_period_days", undefined);
      form.setValue("reminder_days", undefined);
      form.setValue("knockout_voting_period_days", undefined);
    }
  }, [votingEnabled, form]);

  useEffect(() => {
    if (competitionType !== CompetitionType.LEAGUE) {
      form.setValue("number_of_teams", undefined);
      form.setValue("match_type", undefined);
      form.setValue("is_round_robin", false);
    }
  }, [competitionType, form]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col justify-center rounded-lg border-2 border-accent bg-panel-bg p-4 text-center sm:p-6">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent sm:h-12 sm:w-12"></div>
            <p className="text-base font-bold text-accent sm:text-lg">
              Creating competition...
            </p>
          </div>
        </div>
      )}

      <Header title="Create Competition" hasSidebar={true} />

      <div className="relative grid grid-cols-1 gap-4 sm:gap-6">
        <div className="rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg sm:p-6">
          <div className="mb-4 flex items-center sm:mb-6">
            <Trophy className="mr-2 h-5 w-5 text-accent sm:h-6 sm:w-6" />
            <h2 className="text-lg font-bold text-accent sm:text-xl">
              Competition Details
            </h2>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            min={0}
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
                        <FormLabel
                          htmlFor="competitionType"
                          className="mb-1 block text-sm font-medium text-gray-300"
                        >
                          Competition Type
                        </FormLabel>
                        <FormControl>
                          <Select
                            name="competitionType"
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger
                              id="competitionType"
                              className="w-full max-w-xs rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 sm:px-4 sm:py-2"
                            >
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="border-accent/60 bg-panel-bg text-gray-200">
                              {Object.values(CompetitionType).map((type) => (
                                <SelectItem
                                  key={type}
                                  value={type}
                                  className="hover:bg-accent/20 focus:bg-accent/20"
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
                  {competitionType === CompetitionType.LEAGUE && (
                    <div className="space-y-4 border-l-4 border-accent/30 pl-4">
                      <h4 className="font-medium text-accent">
                        League Settings
                      </h4>
                      <FormField
                        name="number_of_teams"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Teams</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min={2}
                                className="w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 no-spinner focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="is_round_robin"
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
                        name="match_type"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="matchType"
                              className="mb-1 block text-sm font-medium text-gray-300"
                            >
                              Match Type
                            </FormLabel>
                            <FormControl>
                              <Select
                                name="matchType"
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger
                                  id="matchType"
                                  className="w-full max-w-xs rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 sm:px-4 sm:py-2"
                                >
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="border-accent/60 bg-panel-bg text-gray-200">
                                  {Object.values(MatchType).map((type) => (
                                    <SelectItem
                                      key={type}
                                      value={type}
                                      className="hover:bg-accent/20 focus:bg-accent/20"
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
                        Teams and fixtures will be created automatically after
                        competition setup.
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="mb-3 border-b border-accent/30 pb-2 text-base font-medium text-gray-200 sm:mb-4 sm:text-lg">
                  Additional Options
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <FormField
                      name="track_seasons"
                      control={form.control}
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
                              Track seasons
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="voting_enabled"
                      control={form.control}
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
                              Voting
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  {votingEnabled && (
                    <div className="ml-0 mt-2 rounded-lg bg-bg/20 p-3 sm:ml-7 sm:p-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <FormField
                          name="voting_period_days"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                                Voting Period (Days)
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
                          name="reminder_days"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                                Reminder To Vote (Days)
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
                        {competitionType === CompetitionType.KNOCKOUT && (
                          <FormField
                            name="knockout_voting_period_days"
                            control={form.control}
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                                  Knockout Voting Period (Days)
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
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-6 border-t border-accent/30 pt-4">
                <InfoBox title="Important note" icon={Info} className="w-11/12">
                  <p>
                    Once a competition is created, the type and certain settings
                    cannot be changed. Please review your settings carefully.
                  </p>
                </InfoBox>

                <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row sm:space-x-4">
                  <Button
                    type="button"
                    className="w-full rounded-lg border-2 border-accent/50 bg-transparent px-4 py-2 text-accent hover:bg-accent/10 sm:w-auto"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid}
                    className="w-full transform rounded-lg border-2 border-accent bg-accent/20 px-4 py-2 text-accent shadow-md transition-all hover:bg-accent/30 sm:w-auto"
                  >
                    <Save size={18} className="mr-2" />
                    Create Competition
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>

        <GuideBox title="Quick Start Guide">
          <p>After creating your competition, you'll need to:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Name teams in your competition</li>
            <li>Add players to teams</li>
            <li>Schedule matches</li>
          </ul>
        </GuideBox>
      </div>
    </div>
  );
};

export default CreateCompetitionForm;
