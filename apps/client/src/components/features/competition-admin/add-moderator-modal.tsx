import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Search, Loader2 } from "lucide-react";
import { InfoBox } from "../../ui/info-box";
import axiosInstance from "../../../config/axios-config";
import { isAxiosError } from "axios";
import { config } from "../../../config/config";
import { toast } from "sonner";
import { useAuth } from "../../../context/auth-context";

interface AddModeratorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  competitionId: string;
  onSuccess: () => void;
  children?: React.ReactNode;
}

interface SearchResult {
  id: string;
  nickname: string;
  email: string;
}

export default function AddModeratorModal({
  isOpen,
  onOpenChange,
  competitionId,
  onSuccess,
  children,
}: AddModeratorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search term");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const response = await axiosInstance.get(
        `${config.server}/api/players/basic`,
        {
          params: {
            userId: user?.id,
            competitionId: competitionId,
            query: searchQuery,
          },
          withCredentials: true,
        },
      );
      setSearchResults(response.data);

      if (response.data.length === 0) {
        toast.info("No users found with that search term");
      }
    } catch (error) {
      console.error("Error searching users:", error);
      const errorMessage =
        (isAxiosError(error) && error.response?.data?.message) ||
        "Failed to search users. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddModerator = async (userId: string, userNickname: string) => {
    setIsAdding(true);
    setError("");

    try {
      await axiosInstance.post(
        `${config.server}/api/competitions/${competitionId}/moderators`,
        { userId },
        { withCredentials: true },
      );

      toast.success(`${userNickname} has been added as a moderator`);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error adding moderator:", error);
      let errorMessage = "Failed to add moderator. Please try again.";
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClose = () => {
    if (!isAdding) {
      setSearchQuery("");
      setSearchResults([]);
      setError("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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

            <div className="flex gap-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by nickname..."
                className="flex-1 rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-2 text-gray-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                disabled={isSearching || isAdding}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || isAdding || !searchQuery.trim()}
                className="rounded-lg border-2 border-accent/50 bg-accent/20 px-3 py-2 text-accent hover:bg-accent/30 disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <InfoBox title="Search Error" variant="error" className="mb-4">
              {error}
            </InfoBox>
          )}

          {searchResults.length > 0 && (
            <div className="mb-4 max-h-64 overflow-y-auto rounded-lg border-2 border-accent/30 bg-bg/20">
              <div className="p-2">
                <p className="mb-2 text-sm font-medium text-accent">
                  Search Results ({searchResults.length})
                </p>
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-md border-2 border-accent/20 bg-bg/30 p-3 transition-colors hover:bg-bg/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-200">
                            {user.nickname}
                          </p>
                          <p className="truncate text-xs text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          handleAddModerator(user.id, user.nickname)
                        }
                        disabled={isAdding}
                        size="sm"
                        className="ml-3 rounded-lg border-2 border-green-500/50 bg-green-500/20 px-3 py-1.5 text-green-400 hover:bg-green-500/30 disabled:opacity-50"
                      >
                        {isAdding ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Add"
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
