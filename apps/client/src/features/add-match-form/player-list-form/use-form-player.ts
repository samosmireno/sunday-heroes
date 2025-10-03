import { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { Team } from "@repo/shared-types";
import { MatchPlayersData } from "../schemas/types";

export function useFormPlayer(form: UseFormReturn, isEdited: boolean) {
  const addPlayerToForm = useCallback(
    (team: Team, player: string, teamPlayers: string[]) => {
      const fieldName = `players.${team.toLowerCase()}Players` as const;
      const updatedPlayers = [...teamPlayers, player];
      form.setValue(fieldName, updatedPlayers);

      if (isEdited) {
        const homePlayers = form.getValues("players.homePlayers");
        const awayPlayers = form.getValues("players.awayPlayers");
        const indexToStore =
          team === Team.HOME
            ? homePlayers.length - 1
            : homePlayers.length + awayPlayers.length - 1;

        const matchPlayers: MatchPlayersData["players"] =
          form.getValues("matchPlayers.players") || [];

        const newMatchPlayer = {
          nickname: player,
          goals: undefined,
          assists: undefined,
          position:
            team === Team.HOME
              ? homePlayers.length - 1
              : awayPlayers.length - 1,
        };

        const newMatchPlayers = [
          ...matchPlayers.slice(0, indexToStore),
          newMatchPlayer,
          ...matchPlayers.slice(indexToStore),
        ];

        form.setValue("matchPlayers.players", newMatchPlayers);
      }
    },
    [form, isEdited],
  );

  const removePlayerFromForm = useCallback(
    (team: Team, player: string, teamPlayers: string[]) => {
      const fieldName = `players.${team.toLowerCase()}Players` as const;
      const updatedPlayers = teamPlayers.filter((p) => p !== player);
      form.setValue(fieldName, updatedPlayers);

      if (isEdited) {
        const matchPlayers: MatchPlayersData["players"] =
          form.getValues("matchPlayers.players") || [];
        const filteredPlayers = matchPlayers.filter(
          (p) => p.nickname !== player,
        );
        form.setValue("matchPlayers.players", filteredPlayers);
      }
    },
    [form, isEdited],
  );

  return {
    addPlayerToForm,
    removePlayerFromForm,
  };
}
