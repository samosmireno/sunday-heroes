import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import { rectSwappingStrategy, SortableContext } from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { UseFormReturn } from "react-hook-form";
import SortableItem from "./sortable-item";
import { swapMatchPlayers, swapItems } from "./utils";
import { MatchPlayersData } from "./add-match-schemas";
import { Team } from "@repo/shared-types";

interface PlayerListProps {
  players: string[];
  onSelect: (arg1: string) => void;
  form: UseFormReturn;
  team: Team;
}

export default function PlayerList({
  players,
  onSelect,
  form,
  team,
}: PlayerListProps) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const currentMatchPlayers = form.getValues(
        "matchPlayers",
      ) as MatchPlayersData;

      if (currentMatchPlayers) {
        const activeId = active.id as string;
        const overId = over.id as string;

        const newMatchPlayers = swapMatchPlayers(
          currentMatchPlayers,
          activeId,
          overId,
        );

        if (newMatchPlayers) {
          form.setValue(`matchPlayers.players`, newMatchPlayers.players);
        }
      }

      const oldIndex = players.indexOf(active.id as string);
      const newIndex = players.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = swapItems(players, oldIndex, newIndex);
        form.setValue(`players.${team.toLocaleLowerCase()}Players`, newItems);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToParentElement]}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={players} strategy={rectSwappingStrategy}>
        <div className="flex flex-wrap justify-start space-x-2 py-4 empty:hidden">
          {players.map((player) => (
            <SortableItem key={player} id={player} onSelect={onSelect} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
