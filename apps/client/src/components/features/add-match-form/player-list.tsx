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
import { useState, useEffect } from "react";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { UseFormReturn } from "react-hook-form";
import { Team } from "../../../types/types";
import SortableItem from "./sortable-item";
import { DuelMatchPlayersForm } from "@repo/shared-types";
import swapMatchPlayers from "./utils";
import swapItems from "../../../utils/utils";

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
  const [items, setItems] = useState<string[]>(players);
  const [matchPlayers, setMatchPlayers] = useState<DuelMatchPlayersForm>(
    form.getValues("matchPlayers") || null,
  );

  useEffect(() => {
    setItems(players);
  }, [players]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      if (matchPlayers) {
        const activeId = active.id as string;
        const overId = over.id as string;

        const newMatchPlayers = swapMatchPlayers(
          matchPlayers,
          activeId,
          overId,
        );

        if (newMatchPlayers) {
          form.setValue(`matchPlayers.players`, newMatchPlayers.players);
          setMatchPlayers(newMatchPlayers);
        }
      }

      setItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);

        const newItems = swapItems(items, oldIndex, newIndex);
        form.setValue(`players.${team.toLocaleLowerCase()}Players`, newItems);
        return newItems;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToParentElement]}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSwappingStrategy}>
        <div className="flex flex-wrap justify-start space-x-2 py-4 empty:hidden">
          {items.map((player) => (
            <SortableItem key={player} id={player} onSelect={onSelect} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
