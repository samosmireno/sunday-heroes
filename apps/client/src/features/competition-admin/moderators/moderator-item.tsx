import { Trash2, Loader2 } from "lucide-react";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";

interface Moderator {
  id: string;
  nickname: string;
}

interface ModeratorItemProps {
  moderator: Moderator;
  onRemove: (moderatorId: string) => void;
  isRemoving: boolean;
}

export function ModeratorItem({
  moderator,
  onRemove,
  isRemoving,
}: ModeratorItemProps) {
  const handleConfirm = async () => {
    onRemove(moderator.id);
  };

  return (
    <div className="flex items-center justify-between rounded-lg border-2 border-accent/20 bg-bg/30 p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-200">{moderator.nickname}</p>
        </div>
      </div>

      <ConfirmationDialog
        title="Remove Moderator"
        description={
          <div className="space-y-2 text-white">
            <p>
              Are you sure you want to remove{" "}
              <strong>{moderator.nickname}</strong> as a moderator?
            </p>
            <p className="text-sm">
              They will lose all moderator privileges for this competition.
            </p>
          </div>
        }
        triggerContent={
          isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 size={14} />
          )
        }
        triggerClassName="bg-red-900/30 text-red-400 hover:bg-red-900/50 h-8 w-8 p-0"
        confirmText="Remove"
        onConfirm={handleConfirm}
        variant="destructive"
        icon="trash"
      />
    </div>
  );
}
