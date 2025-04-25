import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CreateCompetitionFormSchema,
  CreateCompetitionFormValues,
} from "../components/features/add-competition-form/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompetitionType } from "@repo/logger";
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
import { SidebarTrigger } from "../components/ui/sidebar";
import { GuideBox } from "../components/ui/guide-box";
import { InfoBox } from "../components/ui/info-box";

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
      const response = await axiosInstance.post(`/api/competition`, reqData, {
        withCredentials: true,
      });
      console.log("Form submitted with values:", response.data);
      navigate(-1);
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

      <header className="relative mb-4 rounded-lg border-2 border-accent bg-panel-bg p-3 shadow-lg sm:mb-6 sm:p-4 md:mb-8">
        <div className="flex items-center">
          <SidebarTrigger className="mr-2 sm:mr-3" />
          <h1
            className="truncate text-xl font-bold uppercase tracking-wider text-accent sm:text-2xl md:text-3xl"
            style={{ textShadow: "2px 2px 0 #000" }}
          >
            Create Competition
          </h1>
        </div>
      </header>

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
                      <FormItem>
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
                        {competitionType !== CompetitionType.DUEL && (
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
              <div className="space-y-36 border-t border-accent/30 pt-4">
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
            <li>Add teams to your competition</li>
            <li>Add players to teams</li>
            <li>Schedule matches</li>
          </ul>
        </GuideBox>
      </div>
    </div>
  );
};

export default CreateCompetitionForm;
