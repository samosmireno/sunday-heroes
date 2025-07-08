import { useEffect, useState } from "react";
import { Team } from "../../../types/types";
import { AutoComplete } from "./autocomplete";
import { Button } from "../../ui/button";
import { useQuery } from "@tanstack/react-query";
import { useTeamPlayers } from "./use-team-players";
import { UseFormReturn } from "react-hook-form";
import { capitalizeFirstLetter } from "../../../utils/utils";
import PlayerList from "./player-list";
import { useAuth } from "../../../context/auth-context";
import { DuelMatchPlayersForm } from "@repo/shared-types";

interface TeamSectionProps {
  team: Team;
  form: UseFormReturn;
  selectedPlayers: string[];
  setSelectedPlayers: (arg0: string[]) => void;
  isEdited: boolean;
  initialPlayers?: string[];
  isAutocompleteOpen: boolean;
  onAutocompleteOpen: () => void;
  onAutocompleteClose: () => void;
}

export default function TeamSection({
  team,
  form,
  selectedPlayers,
  setSelectedPlayers,
  isEdited,
  initialPlayers,
  isAutocompleteOpen,
  onAutocompleteOpen,
  onAutocompleteClose,
}: TeamSectionProps) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const { user } = useAuth();

  const { players, addPlayer, removePlayer, fetchSuggestions, setPlayers } =
    useTeamPlayers(user?.id ?? null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["data", searchValue],
    queryFn: () => fetchSuggestions(team, searchValue, selectedPlayers),
  });

  function addPlayerToForm(player: string) {
    if (!player || selectedPlayers.includes(player)) {
      return;
    }
    addPlayer(team, player);
    form.setValue(`players.${team.toLocaleLowerCase()}Players`, [
      ...players[team],
      player,
    ]);
    if (isEdited) {
      const homePlayers = form.getValues("players.homePlayers");
      const awayPlayers = form.getValues("players.awayPlayers");
      const indexToStore =
        team === Team.HOME
          ? homePlayers.length - 1
          : homePlayers.length + awayPlayers.length - 1;
      const matchPlayers: DuelMatchPlayersForm["players"] = form.getValues(
        "matchPlayers.players",
      );
      const newMatchPlayer = {
        nickname: player,
        goals: undefined,
        assists: undefined,
        position:
          team === Team.HOME ? homePlayers.length - 1 : awayPlayers.length - 1,
      };
      const newMatchPlayers = [
        ...matchPlayers.slice(0, indexToStore),
        newMatchPlayer,
        ...matchPlayers.slice(indexToStore),
      ];
      form.setValue("matchPlayers.players", newMatchPlayers);
    }
    setSelectedPlayers([...selectedPlayers, player]);
    console.log(selectedPlayers);
  }

  function removePlayerFromForm(player: string) {
    removePlayer(team, player);
    form.setValue(`players.${team.toLocaleLowerCase()}Players`, [
      ...players[team].filter((p) => p !== player),
    ]);
    if (isEdited) {
      const matchPlayers: DuelMatchPlayersForm["players"] =
        form.getValues("matchPlayers.players") || [];
      form.setValue(
        "matchPlayers.players",
        matchPlayers.filter((p) => p.nickname !== player),
      );
    }
    setSelectedPlayers(selectedPlayers.filter((p) => p !== player));
  }

  const reset = () => {
    setSelectedValue("");
    setSearchValue("");
  };

  useEffect(() => {
    refetch();
  }, [refetch, selectedPlayers]);

  useEffect(() => {
    if (initialPlayers) {
      setPlayers((prev) => ({
        ...prev,
        [team]: initialPlayers,
      }));
    }
  }, [initialPlayers]);

  return (
    <div className="flex flex-col px-12">
      <div className="mb-2 font-semibold text-gray-400">
        {team} Team Players
      </div>
      <div className="flex justify-between">
        <AutoComplete
          selectedValue={selectedValue}
          onSelectedValueChange={setSelectedValue}
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          items={(data ?? []).map((item: string) => ({
            value: item,
            label: item,
          }))}
          isLoading={isLoading}
          onItemSelect={(value) => {
            addPlayerToForm(value);
          }}
          isOpen={isAutocompleteOpen}
          onOpenChange={(open) => {
            if (open) {
              onAutocompleteOpen();
            } else {
              onAutocompleteClose();
            }
          }}
        />
        <Button
          onClick={() => {
            addPlayerToForm(capitalizeFirstLetter(searchValue));
            reset();
          }}
          className="border-2 border-accent bg-accent/20 px-4 py-2 font-bold text-accent transition-all hover:bg-accent/30"
          disabled={!searchValue.trim()}
        >
          Add
        </Button>
      </div>
      <PlayerList
        players={players[team]}
        onSelect={(player: string) => {
          removePlayerFromForm(player);
        }}
        form={form}
        team={team}
      />
    </div>
  );
}
