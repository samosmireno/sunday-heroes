import { useState } from "react";
import { CompetitionResponse } from "@repo/shared-types";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { AlertTriangle, Trash2 } from "lucide-react";
import axiosInstance from "../../../config/axios-config";
import { config } from "../../../config/config";
import { DialogTrigger } from "@radix-ui/react-dialog";

interface DeleteCompetitionDialogProps {
  competition: CompetitionResponse;
  onSuccess: () => void;
}

export default function DeleteCompetitionDialog({
  competition,
  onSuccess,
}: DeleteCompetitionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setIsOpen(false);
    setError("");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      await axiosInstance.delete(
        `${config.server}/api/competitions/${competition.id}`,
        {
          withCredentials: true,
        },
      );
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error deleting competition:", error);
      setError("Failed to delete competition. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          className="bg-red-900/30 text-red-400 hover:bg-red-900/70"
        >
          Delete Competition
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-md border-2 border-red-500 bg-panel-bg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-red-500">
            <AlertTriangle size={24} />
            Delete Competition
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-2">
            <p className="text-gray-200">
              This action cannot be undone. This will permanently delete the
              competition
              <span className="font-semibold text-accent">
                {" "}
                "{competition.name}"
              </span>{" "}
              and remove all associated data including:
            </p>

            <ul className="ml-4 list-inside list-disc space-y-1 text-sm text-gray-300">
              <li>All matches and results</li>
              <li>Player statistics</li>
              <li>Team information</li>
              <li>Voting data (if enabled)</li>
              <li>Competition history</li>
            </ul>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-900/30 p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-3">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={isDeleting}
            className="rounded-lg border-2 border-accent/50 bg-transparent px-4 py-2 font-bold text-gray-300 transition-all hover:bg-accent/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="transform rounded-lg border-2 border-red-500 bg-red-500/20 px-4 py-2 font-bold text-red-400 shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-red-500/30"
          >
            {isDeleting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                Delete Competition
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
