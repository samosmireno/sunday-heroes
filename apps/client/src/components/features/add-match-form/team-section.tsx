import { useEffect, useState } from "react";
import { Team } from "@repo/shared-types";
import { AutoComplete } from "./autocomplete";
import { Button } from "../../ui/button";
import { useQuery } from "@tanstack/react-query";
import { useTeamPlayers } from "./use-team-players";
import { UseFormReturn } from "react-hook-form";
import { capitalizeFirstLetter } from "../../../utils/utils";
import PlayerList from "./player-list";
import { useAuth } from "../../../context/auth-context";
import { MatchPlayersData } from "./add-match-schemas";
import { useParams } from "react-router-dom";

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
  const { competitionId } = useParams<{
    matchId: string;
    competitionId: string;
  }>();

  const { players, addPlayer, removePlayer, fetchSuggestions, setPlayers } =
    useTeamPlayers(user?.id ?? null, competitionId ?? "");

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: [
      "playerSuggestions",
      team,
      searchValue,
      selectedPlayers,
      competitionId,
      user?.id,
    ],
    queryFn: () => fetchSuggestions(searchValue, selectedPlayers),
    staleTime: 1000 * 60 * 5, // 5 minutes
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
      const matchPlayers: MatchPlayersData["players"] = form.getValues(
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
  }

  function removePlayerFromForm(player: string) {
    removePlayer(team, player);
    form.setValue(`players.${team.toLocaleLowerCase()}Players`, [
      ...players[team].filter((p) => p !== player),
    ]);
    if (isEdited) {
      const matchPlayers: MatchPlayersData["players"] =
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
    if (initialPlayers) {
      setPlayers((prev) => ({
        ...prev,
        [team]: initialPlayers,
      }));
    }
  }, [initialPlayers, setPlayers, team]);

  return (
    <div className="flex flex-col px-3 sm:px-6 md:px-8 lg:px-12">
      <div className="mb-3 text-sm font-semibold text-gray-400 sm:mb-2 sm:text-base">
        {team} Team Players
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <AutoComplete
            selectedValue={selectedValue}
            onSelectedValueChange={setSelectedValue}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            items={suggestions.map((item: string) => ({
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
        </div>
        <Button
          onClick={() => {
            addPlayerToForm(capitalizeFirstLetter(searchValue));
            reset();
          }}
          className="w-full border-2 border-accent bg-accent/20 px-4 py-2 font-bold text-accent transition-all hover:bg-accent/30 sm:w-auto sm:min-w-[80px]"
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
