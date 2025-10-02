import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { XIcon } from "lucide-react";

interface SortableItemProps {
  id: string;
  onSelect: (arg1: string) => void;
}

export default function SortableItem({ id, onSelect }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, setActivatorNodeRef } =
    useSortable({ id });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  return (
    <Button
      ref={setNodeRef}
      type="button"
      style={style}
      className="m-1 touch-none items-center justify-center space-x-2 border-2 border-accent/40 bg-primary/30 p-0 text-gray-300 hover:bg-bg/60"
    >
      <span
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="m-0 cursor-grab p-4 active:cursor-grabbing"
      >
        {id}
      </span>
      <div
        className="cursor-pointer p-1 hover:text-red-400"
        onClick={() => onSelect(id)}
      >
        <XIcon />
      </div>
    </Button>
  );
}
