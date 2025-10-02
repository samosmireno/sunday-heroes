import useOutsideClick from "@/hooks/use-outside-click";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  const ref = useOutsideClick(onCancel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 font-retro">
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className="relative w-full max-w-md transform overflow-hidden rounded-lg border-2 border-accent bg-panel-bg p-5 text-center shadow-lg transition-all sm:p-6"
      >
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <h3
          className="mb-2 text-xl font-bold uppercase tracking-wider text-accent"
          style={{ textShadow: "1px 1px 0 #000" }}
        >
          Confirm Deletion
        </h3>

        <p className="mb-6 text-gray-300">
          Are you sure you want to delete this match?
        </p>

        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
          <Button
            onClick={onCancel}
            className="rounded-lg border-2 border-accent/50 bg-transparent px-4 py-2 font-bold text-gray-300 transition-all hover:bg-accent/10"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="transform rounded-lg border-2 border-red-500 bg-red-500/20 px-4 py-2 font-bold text-red-400 shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-red-500/30"
          >
            Delete Match
          </Button>
        </div>
      </div>
    </div>
  );
}
