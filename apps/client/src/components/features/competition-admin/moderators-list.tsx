import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Shield, Trash2 } from "lucide-react";
import axiosInstance from "../../../config/axiosConfig";
import { config } from "../../../config/config";
import ConfirmationDialog from "../../ui/confirmation-dialog";

interface Moderator {
  id: string;
  nickname: string;
}

interface ModeratorsListProps {
  moderators: Moderator[];
  onUpdate: () => void;
}

export default function ModeratorsList({
  moderators,
  onUpdate,
}: ModeratorsListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemoveModerator = async (moderatorId: string) => {
    setRemovingId(moderatorId);

    try {
      await axiosInstance.delete(
        `${config.server}/api/competitions/moderators/${moderatorId}`,
        { withCredentials: true },
      );
      onUpdate();
    } catch (error) {
      console.error("Error removing moderator:", error);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Card className="w-1/2 border-2 border-accent/50 bg-panel-bg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          Moderators ({moderators.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {moderators.length === 0 ? (
          <div className="py-8 text-center">
            <Shield size={48} className="mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No moderators added yet</p>
            <p className="text-sm text-gray-500">
              Add moderators to help manage this competition
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {moderators.map((moderator) => (
              <div
                key={moderator.id}
                className="flex items-center justify-between rounded-lg border-2 border-accent/20 bg-bg/30 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="relative"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-200">
                        {moderator.nickname}
                      </p>
                    </div>
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
                        They will lose all moderator privileges for this
                        competition.
                      </p>
                    </div>
                  }
                  triggerContent={
                    removingId === moderator.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent"></div>
                    ) : (
                      <Trash2 size={14} />
                    )
                  }
                  triggerClassName="bg-red-900/30 text-red-400 hover:bg-red-900/50 h-8 w-8 p-0"
                  confirmText="Remove"
                  onConfirm={() => handleRemoveModerator(moderator.id)}
                  variant="destructive"
                  icon="trash"
                  loadingText="Removing..."
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
