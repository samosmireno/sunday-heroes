import { useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { DuelFormData } from "./add-match-schemas";
import { Team } from "@repo/shared-types";

interface TeamInputStatsProps {
  team: Team;
  formData: DuelFormData;
  form: UseFormReturn;
}

export default function TeamInputStats({
  team,
  formData,
  form,
}: TeamInputStatsProps) {
  const players =
    team === Team.HOME
      ? formData.players.homePlayers
      : formData.players.awayPlayers;

  const offset = team === Team.AWAY ? formData.players.homePlayers.length : 0;

  useEffect(() => {
    players.forEach((player, index) => {
      form.setValue(`matchPlayers.players.${index + offset}.nickname`, player);
      form.setValue(
        `matchPlayers.players.${index + offset}.position`,
        index + 1,
      );
    });
  }, [form, offset, players]);

  return (
    <div className="flex flex-col space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 md:px-8 lg:px-12">
      <h2 className="text-base font-bold text-accent sm:text-lg">
        {team} Team
      </h2>
      <div className="grid gap-4 sm:gap-6">
        {players.map((player, index) => (
          <div
            className="rounded-lg border-2 border-accent/30 bg-bg/30 p-3 shadow-md sm:p-4 md:p-5"
            key={`${team}-${player}`}
          >
            <h3 className="mb-3 border-b border-accent/30 pb-2 text-sm font-medium text-gray-200 sm:mb-4 sm:text-base">
              {player}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <FormField
                key={`${team}-goals-${player}`}
                name={`matchPlayers.players.${index + offset}.goals`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <FormLabel className="text-xs font-medium text-gray-300 sm:text-sm">
                        Goals
                      </FormLabel>
                      <div className="flex flex-col gap-1">
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            defaultValue={0}
                            className="w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-2 text-center text-gray-200 no-spinner focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:w-20 sm:px-3 sm:py-1.5"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400 sm:text-sm" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                key={`${team}-assist-${player}`}
                name={`matchPlayers.players.${index + offset}.assists`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <FormLabel className="text-xs font-medium text-gray-300 sm:text-sm">
                        Assists
                      </FormLabel>
                      <div className="flex flex-col gap-1">
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            defaultValue={0}
                            className="w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-2 text-center text-gray-200 no-spinner focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:w-20 sm:px-3 sm:py-1.5"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400 sm:text-sm" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
