import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRemoveModerator } from "./use-remove-moderator";
import { ModeratorItem } from "./moderator-item";
import { EmptyModeratorsState } from "./empty-moderators";

interface Moderator {
  id: string;
  nickname: string;
}

interface ModeratorsListProps {
  moderators: Moderator[];
  competitionId: string;
}

export default function ModeratorsList({
  moderators,
  competitionId,
}: ModeratorsListProps) {
  const removeModerator = useRemoveModerator(competitionId);

  const handleRemoveModerator = (moderatorId: string) => {
    removeModerator.mutate(moderatorId);
  };

  return (
    <Card className="w-full border-2 border-transparent bg-panel-bg p-0 xl:w-1/2">
      <CardHeader className="p-4">
        <CardTitle className="text-accent">
          Moderators ({moderators.length})
        </CardTitle>
      </CardHeader>

      <CardContent>
        {moderators.length === 0 ? (
          <EmptyModeratorsState />
        ) : (
          <div className="space-y-3">
            {moderators.map((moderator) => (
              <ModeratorItem
                key={moderator.id}
                moderator={moderator}
                onRemove={handleRemoveModerator}
                isRemoving={removeModerator.isPending}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
