import { useEffect, useState } from "react";
import { Team } from "../../../types/types";
import { AutoComplete } from "./autocomplete";
import { Button } from "../../ui/button";
import { useQuery } from "@tanstack/react-query";
import { useTeamPlayers } from "./use-team-players";
import { UseFormReturn } from "react-hook-form";
import { capitalizeFirstLetter } from "../../../utils/utils";
import PlayerList from "./player-list";

interface TeamSectionProps {
  team: Team;
  form: UseFormReturn;
  selectedPlayers: string[];
  setSelectedPlayers: (arg0: string[]) => void;
  initialPlayers?: string[];
}

export default function TeamSection({
  team,
  form,
  selectedPlayers,
  setSelectedPlayers,
  initialPlayers,
}: TeamSectionProps) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>("");

  const { players, addPlayer, removePlayer, fetchSuggestions, setPlayers } =
    useTeamPlayers();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["data", searchValue],
    queryFn: () => fetchSuggestions(team, searchValue, selectedPlayers),
  });

  function addPlayerToForm(player: string) {
    addPlayer(team, player);
    form.setValue(`players.${team.toLocaleLowerCase()}Players`, [
      ...players[team],
      player,
    ]);
    setSelectedPlayers([...selectedPlayers, player]);
  }

  function removePlayerFromForm(player: string) {
    removePlayer(team, player);
    form.setValue(`players.${team.toLocaleLowerCase()}Players`, [
      ...players[team].filter((p) => p !== player),
    ]);
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
      <label className="mb-2 font-semibold text-gray-400">
        {team} Team Players
      </label>
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
        />
        <Button
          onClick={() => {
            addPlayerToForm(capitalizeFirstLetter(searchValue));
            reset();
          }}
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
