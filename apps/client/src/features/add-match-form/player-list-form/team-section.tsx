import { useEffect, useState } from "react";
import { Team, UserResponse } from "@repo/shared-types";
import { AutoComplete } from "../../../components/ui/autocomplete";
import { Button } from "@/components/ui/button";
import { usePlayerManagement } from "./use-player-management";
import { UseFormReturn } from "react-hook-form";
import { capitalizeFirstLetter } from "@/utils/string";
import PlayerList from "./player-list";
import { useAuth } from "@/context/auth-context";
import { useParams } from "react-router-dom";
import { usePlayerSuggestions } from "./use-player-suggestions";
import { useFormPlayer } from "./use-form-player";

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
  const { user } = useAuth() as { user: UserResponse };
  const { competitionId } = useParams() as { competitionId: string };

  const { players, addPlayer, removePlayer, initializePlayers } =
    usePlayerManagement();

  const { data: suggestions = [], isLoading } = usePlayerSuggestions(
    user.id,
    competitionId,
    team,
    searchValue,
    selectedPlayers,
  );

  const { addPlayerToForm, removePlayerFromForm } = useFormPlayer(
    form,
    isEdited,
  );

  const reset = () => {
    setSelectedValue("");
    setSearchValue("");
  };

  const handleAddPlayer = (player: string) => {
    if (!player || selectedPlayers.includes(player)) {
      return;
    }

    addPlayer(team, player);
    addPlayerToForm(team, player, players[team]);
    setSelectedPlayers([...selectedPlayers, player]);
  };

  const handleRemovePlayer = (player: string) => {
    removePlayer(team, player);
    removePlayerFromForm(team, player, players[team]);
    setSelectedPlayers(selectedPlayers.filter((p) => p !== player));
  };

  const handleAddClick = () => {
    handleAddPlayer(capitalizeFirstLetter(searchValue));
    reset();
  };

  const handleAutocompleteOpenChange = (open: boolean) => {
    if (open) {
      onAutocompleteOpen();
    } else {
      onAutocompleteClose();
    }
  };

  useEffect(() => {
    if (initialPlayers) {
      initializePlayers(team, initialPlayers);
    }
  }, [initialPlayers, initializePlayers, team]);

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
            onItemSelect={handleAddPlayer}
            isOpen={isAutocompleteOpen}
            onOpenChange={handleAutocompleteOpenChange}
          />
        </div>
        <Button
          onClick={handleAddClick}
          className="w-full border-2 border-accent bg-accent/20 px-4 py-2 font-bold text-accent transition-all hover:bg-accent/30 sm:w-auto sm:min-w-[80px]"
          disabled={!searchValue.trim()}
        >
          Add
        </Button>
      </div>
      <PlayerList
        players={players[team]}
        onSelect={handleRemovePlayer}
        form={form}
        team={team}
      />
    </div>
  );
}
