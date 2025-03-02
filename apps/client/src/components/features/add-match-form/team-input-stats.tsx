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
import { AddDuelFormValues } from "@repo/logger";
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
    <div className="flex flex-col space-y-4 py-4">
      <h2 className="px-8 font-medium">{team} Team</h2>
      {players.map((player, index) => (
        <div
          className="mx-12 flex flex-col space-y-4 rounded-xl border-2 border-green-500 px-8 py-4"
          key={`${team}-${index}`}
        >
          <h3 className="font-bold">{player}</h3>
          <FormField
            key={`${team}-goals-${index}`}
            name={`matchPlayers.players.${index + offset}.goals`}
            render={({ field }) => (
              <div className="flex flex-col space-y-8">
                <FormItem>
                  <div className="flex flex-row items-center justify-between px-4">
                    <FormLabel>Goals</FormLabel>
                    <div className="flex flex-col items-end">
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          className="border-1 w-20 rounded-md bg-green-100 p-2 focus:outline-none focus:ring-2"
                        />
                      </FormControl>
                      <FormMessage />
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
              <div className="flex flex-col space-y-8">
                <FormItem>
                  <div className="flex flex-row items-center justify-between px-4">
                    <FormLabel>Assists</FormLabel>
                    <div className="flex flex-col items-end">
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          className="border-1 w-20 rounded-md bg-green-100 p-2 focus:outline-none focus:ring-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              </div>
            )}
          />
          {/* <FormField
            key={`${team}-rating-${index}`}
            name={`matchPlayers.players.${index + offset}.rating`}
            render={({ field }) => (
              <div className="flex flex-col space-y-8">
                <FormItem>
                  <div className="flex flex-row items-center justify-between px-4">
                    <FormLabel>Rating</FormLabel>
                    <div className="flex flex-col items-end">
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          step={0.01}
                          className="border-1 w-20 rounded-md bg-green-100 p-2 focus:outline-none focus:ring-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              </div>
            )}
          /> */}
        </div>
      ))}
    </div>
  );
}
