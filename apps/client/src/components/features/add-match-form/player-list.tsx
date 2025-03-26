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
import { DuelMatchPlayersForm } from "@repo/logger";

interface PlayerListProps {
  players: string[];
  onSelect: (arg1: string) => void;
  form: UseFormReturn;
  team: Team;
}

function swapItems(array: string[], index1: number, index2: number): string[] {
  const newArray = [...array];
  [newArray[index1], newArray[index2]] = [newArray[index2], newArray[index1]];
  return newArray;
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
        const newMatchPlayers = structuredClone(matchPlayers);
        const oldMatchPlayerIndex = newMatchPlayers?.players?.findIndex(
          (matchPlayer) => matchPlayer?.nickname === active.id,
        );
        const newMatchPlayerIndex = newMatchPlayers?.players?.findIndex(
          (matchPlayer) => matchPlayer?.nickname === over.id,
        );

        console.log(active.id, over.id);

        if (oldMatchPlayerIndex !== -1 && newMatchPlayerIndex !== -1) {
          const oldPosition =
            newMatchPlayers.players[oldMatchPlayerIndex].position;
          const newPosition =
            newMatchPlayers.players[newMatchPlayerIndex].position;

          const oldPlayer = newMatchPlayers.players[oldMatchPlayerIndex];
          newMatchPlayers.players[oldMatchPlayerIndex] =
            newMatchPlayers.players[newMatchPlayerIndex];
          newMatchPlayers.players[newMatchPlayerIndex] = oldPlayer;

          newMatchPlayers.players[oldMatchPlayerIndex].position = oldPosition;
          newMatchPlayers.players[newMatchPlayerIndex].position = newPosition;

          form.setValue(`matchPlayers.players`, newMatchPlayers.players);

          setMatchPlayers(newMatchPlayers);
        }
      }

      setItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);

        const newItems = swapItems(items, oldIndex, newIndex);
        console.log("newItems:", newItems);
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
