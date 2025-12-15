import { useParams } from "react-router-dom";
import { useTopMatches } from "./hooks/use-top-matches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/string";
import { getResultColor } from "./utils";

export default function TopMatches() {
  const { playerId } = useParams() as { playerId: string };
  const { topMatches, isLoading } = useTopMatches(playerId);

  if (isLoading) {
    return (
      <Card className="border-2 border-accent bg-panel-bg">
        <CardHeader className="animate-pulse">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gray-700/20" />
            <div className="h-6 w-32 rounded bg-gray-700/20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg bg-gray-700/10"
            />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!topMatches) {
    return (
      <Card className="border-2 border-accent bg-panel-bg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
            Top Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">No matches available</p>
        </CardContent>
      </Card>
    );
  }

  const matchTypes = [
    {
      match: topMatches.topGoals,
      label: "Top Goals",
      stat: topMatches.topGoals?.goals,
      statLabel: "GOALS",
    },
    {
      match: topMatches.topAssists,
      label: "Top Assists",
      stat: topMatches.topAssists?.assists,
      statLabel: "ASST",
    },
    {
      match: topMatches.topRating,
      label: "Top Rating",
      stat: topMatches.topRating?.rating.toFixed(1),
      statLabel: "RATING",
    },
  ];

  return (
    <Card className="h-full border-2 border-accent bg-panel-bg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
          Top Matches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {matchTypes.map(({ match, label, stat, statLabel }) => {
          if (!match) {
            return (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border-2 border-accent/30 bg-gray-800/20 p-3"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-gray-500">No data</p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={label} className="group block">
              <div className="flex items-center gap-4 rounded-lg border-2 border-accent/30 bg-gray-800/20 p-3">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-xs font-medium text-white">{label}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {match.opponent !== "Away" && match.opponent !== "Home"
                      ? `vs ${match.opponent}`
                      : ""}
                  </p>
                  <p className="text-xs text-gray-400">
                    {match.competition.name} - {formatDate(match.date)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-accent">{stat}</div>
                    <div className="text-xs text-gray-400">{statLabel}</div>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${getResultColor(match.result, false)}`}
                  >
                    {match.result}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
