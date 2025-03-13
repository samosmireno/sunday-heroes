import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CreateCompetitionFormSchema,
  CreateCompetitionFormValues,
} from "../components/features/add-competition-form/schema";
import { z } from "zod";
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
import { ChevronLeft, HelpCircle, Info, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { transformCompetitionFormToRequest } from "../utils/transform";
import { useParams } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";

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
  const { dashboardId } = useParams() as { dashboardId: string };

  const votingEnabled: boolean = form.watch("voting_enabled");
  const competitionType: CompetitionType = form.watch("type");

  async function onSubmit(values: CreateCompetitionFormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!dashboardId) {
      setIsSubmitting(false);
      return;
    }
    const reqData = transformCompetitionFormToRequest(values, dashboardId);
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
    <div className="mx-auto max-w-4xl p-6">
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col justify-center rounded-lg bg-white p-6 text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
            <p className="text-lg font-semibold">Submitting form...</p>
          </div>
        </div>
      )}
      <div className="mb-6">
        <Button
          className="mb-4 flex items-center bg-transparent text-sm text-green-600 shadow-none"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Dashboard
        </Button>

        <h1 className="text-2xl font-bold text-gray-800">
          Create New Competition
        </h1>
        <p className="text-gray-500">
          Set up a new football competition with your preferred settings
        </p>
      </div>
      <div className="overflow-hidden rounded-xl bg-white p-6 shadow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h2 className="mb-4 text-lg font-medium text-gray-800">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex max-w-max flex-col">
                      <FormLabel className="mb-1 block text-sm font-medium text-gray-700">
                        Competition name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          min={0}
                          className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </FormControl>
                      <FormMessage />
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
                        className="mb-1 block text-sm font-medium text-gray-700"
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
                            className="w-60 rounded-lg border-2 border-gray-300 px-4 py-2"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(CompetitionType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {capitalizeFirstLetter(type.toString())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div>
              <h2 className="mb-4 text-lg font-medium text-gray-800">
                Additional Options
              </h2>
              <div className="space-y-4">
                <FormField
                  name="track_seasons"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-medium text-gray-700">
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
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-medium text-gray-700">
                          Voting
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                {votingEnabled && (
                  <div className="ml-7 mt-2">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        name="voting_period_days"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="flex max-w-max flex-col">
                            <FormLabel className="mb-1 block text-sm font-medium text-gray-700">
                              Voting Period (Days)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min={0}
                                className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="reminder_days"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="flex max-w-max flex-col">
                            <FormLabel className="mb-1 block text-sm font-medium text-gray-700">
                              Reminder To Vote (Days)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min={0}
                                className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {competitionType !== CompetitionType.DUEL && (
                        <FormField
                          name="knockout_voting_period_days"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="flex max-w-max flex-col">
                              <FormLabel className="mb-1 block text-sm font-medium text-gray-700">
                                Knockout Voting Period (Days)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min={0}
                                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="mb-6 rounded-lg bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info
                      className="h-5 w-5 text-green-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Important note
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Once a competition is created, the type and certain
                        settings cannot be changed. Please review your settings
                        carefully.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  className="rounded-lg border-2 border-gray-300 bg-transparent px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  <Save size={18} className="mr-2" />
                  Create Competition
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
      <div className="mt-6 rounded-xl bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <HelpCircle
              className="h-5 w-5 text-yellow-400"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Quick Start Guide
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>After creating your competition, you'll need to:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>Add teams to your competition</li>
                <li>Add players to teams</li>
                <li>Schedule matches</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCompetitionForm;
