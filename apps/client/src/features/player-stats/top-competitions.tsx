import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { useTopCompetitions } from "./hooks/use-top-competitions";

export default function TopCompetitions() {
  const { playerId } = useParams() as { playerId: string };
  const { topCompetitions, isLoading } = useTopCompetitions(playerId);

  if (isLoading) {
    return (
      <Card className="border-2 border-accent bg-panel-bg">
        <CardHeader className="animate-pulse">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gray-700/20" />
            <div className="h-6 w-40 rounded bg-gray-700/20" />
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

  if (!topCompetitions) {
    return (
      <Card className="border-2 border-accent bg-panel-bg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
            Top Competitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">No competitions available</p>
        </CardContent>
      </Card>
    );
  }

  const competitionsMap = new Map<
    string,
    {
      competition: any;
      categories: Array<{
        label: string;
        stat: number;
        statLabel: string;
      }>;
    }
  >();

  const categories = [
    {
      competition: topCompetitions.topGoals,
      label: "Goals",
      stat: topCompetitions.topGoals?.totalGoals ?? 0,
      statLabel: "Goals",
    },
    {
      competition: topCompetitions.topAssists,
      label: "Assists",
      stat: topCompetitions.topAssists?.totalAssists ?? 0,
      statLabel: "Assists",
    },
    {
      competition: topCompetitions.topRating,
      label: "Rating",
      stat: topCompetitions.topRating?.avgRating ?? 0,
      statLabel: "Rating",
    },
  ];

  categories.forEach(({ competition, label, stat, statLabel }) => {
    if (competition) {
      const existing = competitionsMap.get(competition.competitionId);
      const category = { label, stat, statLabel };

      if (existing) {
        existing.categories.push(category);
      } else {
        competitionsMap.set(competition.competitionId, {
          competition,
          categories: [category],
        });
      }
    }
  });

  const uniqueCompetitions = Array.from(competitionsMap.values());

  return (
    <Card className="h-full border-2 border-accent bg-panel-bg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
          Top Competitions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {uniqueCompetitions.length > 0 ? (
          uniqueCompetitions.map(({ competition, categories }) => {
            return (
              <div key={competition.competitionId} className="group block">
                <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-accent/30 bg-gray-800/20 p-3 sm:flex-row">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-xs font-medium text-gray-400">
                        {categories.map((c) => c.label).join(", ")}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {competition.competitionName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {competition.competitionType}
                      {" • "}
                      {competition.matchCount}{" "}
                      {competition.matchCount === 1 ? "match" : "matches"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {categories.map((category, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-lg font-bold text-accent">
                          {typeof category.stat === "number"
                            ? category.stat % 1 === 0
                              ? category.stat
                              : category.stat.toFixed(1)
                            : category.stat}
                        </div>
                        <div className="text-xs text-gray-400">
                          {category.statLabel}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-400">No competitions available</p>
        )}
      </CardContent>
    </Card>
  );
}
