import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  nickname: string;
  email: string;
}

interface UserSearchResultsProps {
  results: SearchResult[];
  onAddModerator: (userId: string, userNickname: string) => void;
  isAdding: boolean;
  searchTerm?: string;
}

export default function UserSearchResults({
  results,
  onAddModerator,
  isAdding,
  searchTerm,
}: UserSearchResultsProps) {
  if (searchTerm && results.length === 0)
    return (
      <div className="mb-4 rounded-lg border-2 border-accent/30 bg-bg/20 p-4 text-center">
        <p className="text-sm text-gray-400">
          No users found matching your search.
        </p>
      </div>
    );

  return (
    <>
      {results.length !== 0 && (
        <div className="mb-4 max-h-64 overflow-y-auto rounded-lg border-2 border-accent/30 bg-bg/20">
          <div className="p-2">
            <p className="mb-2 text-sm font-medium text-accent">
              Search Results ({results.length})
            </p>
            <div className="space-y-2">
              {results.map((user) => (
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
                    onClick={() => onAddModerator(user.id, user.nickname)}
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
    </>
  );
}
