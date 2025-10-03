import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoBox } from "@/components/ui/info-box";
import { useUserSearch } from "./use-user-search";
import { useAddModerator } from "./use-add-moderator";
import UserSearchInput from "./user-search-input";
import UserSearchResults from "./user-search-results";

interface AddModeratorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  competitionId: string;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export default function AddModeratorModal({
  isOpen,
  onOpenChange,
  competitionId,
  onSuccess,
  children,
}: AddModeratorModalProps) {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    triggerSearch,
    clearSearch,
    searchTerm,
  } = useUserSearch(competitionId);

  const { addModerator, isAdding } = useAddModerator(competitionId);

  useEffect(() => {
    if (!isOpen) {
      clearSearch();
    }
  }, [isOpen, clearSearch]);

  const handleAddModerator = async (userId: string, userNickname: string) => {
    const success = await addModerator(userId, userNickname);
    if (success) {
      onSuccess?.();
      onOpenChange(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isAdding) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="w-full max-w-md border-2 border-accent/60 bg-panel-bg p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-accent/30 bg-accent/10 px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-accent">
            Add Moderator
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6">
          <div className="mb-4 space-y-4">
            <InfoBox
              title="Add Competition Moderator"
              variant="info"
              className="mb-4"
            >
              Search for users by nickname to add them as moderators for this
              competition.
            </InfoBox>

            <UserSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={triggerSearch}
              isSearching={isSearching}
              disabled={isAdding}
            />
          </div>

          <UserSearchResults
            results={searchResults}
            onAddModerator={handleAddModerator}
            isAdding={isAdding}
            searchTerm={searchTerm}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
