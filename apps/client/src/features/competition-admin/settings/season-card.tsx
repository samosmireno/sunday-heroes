import { CurrentSeasonResponse } from "@repo/shared-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currentSeasonLabel } from "./season-label";

interface SeasonCardProps {
  currentSeason: CurrentSeasonResponse;
}

export default function SeasonCard({ currentSeason }: SeasonCardProps) {
  return (
    <Card className="border-2 border-accent/50 bg-panel-bg">
      <CardHeader>
        <CardTitle className="text-accent">Season</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-200">
          {currentSeasonLabel(currentSeason)}
        </p>
      </CardContent>
    </Card>
  );
}
