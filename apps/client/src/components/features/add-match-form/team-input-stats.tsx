import { useEffect } from "react";
import { Team } from "../../../types/types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { AddDuelFormValues } from "@repo/shared-types";
import { UseFormReturn } from "react-hook-form";

interface TeamInputStatsProps {
  team: Team;
  formData: AddDuelFormValues;
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
    <div className="flex flex-col space-y-6 py-4">
      <h2 className="px-4 text-lg font-bold text-accent sm:px-6">
        {team} Team
      </h2>
      {players.map((player, index) => (
        <div
          className="rounded-lg border-2 border-accent/30 bg-bg/30 p-4 shadow-md sm:p-5"
          key={`${team}-${index}`}
        >
          <h3 className="mb-4 border-b border-accent/30 pb-2 text-base font-medium text-gray-200">
            {player}
          </h3>
          <FormField
            key={`${team}-goals-${index}`}
            name={`matchPlayers.players.${index + offset}.goals`}
            render={({ field }) => (
              <div className="mb-4">
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-gray-300">
                      Goals
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          className="w-20 rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-center text-gray-200 no-spinner focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </div>
                  </div>
                </FormItem>
              </div>
            )}
          />
          <FormField
            key={`${team}-assist-${index}`}
            name={`matchPlayers.players.${index + offset}.assists`}
            render={({ field }) => (
              <div>
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-gray-300">
                      Assists
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          className="w-20 rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-center text-gray-200 no-spinner focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </div>
                  </div>
                </FormItem>
              </div>
            )}
          />
        </div>
      ))}
    </div>
  );
}
