// PROTOTYPE — throwaway. The All Matches table with an optional Season
// column and the closed-season mark where the actions sit.
import React, { useState } from "react";
import { CheckSquare, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { MatchPageResponse } from "@repo/shared-types";
import { Button } from "@/components/ui/button";
import { MatchDetails } from "@/features/matches/match-details";
import { convertMatchType, formatDate } from "@/utils/string";
import { ProtoSeason } from "./fake-seasons";
import { ClosedSeasonBadge } from "./season-marks";

interface MatchesTableViewProps {
  rows: MatchPageResponse[];
  seasonOf: (matchId: string) => ProtoSeason;
  showSeasonColumn: boolean;
}

const th = "whitespace-nowrap px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-accent md:px-4 md:py-3";

export default function MatchesTableView({ rows, seasonOf, showSeasonColumn }: MatchesTableViewProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <div className="relative mx-0">
      <div className="overflow-x-auto pb-2">
        <table className="min-w-full divide-y divide-accent/30">
          <thead>
            <tr className="border-b-2 border-accent/50">
              <th className={th}>Date</th>
              {showSeasonColumn && <th className={th}>Season</th>}
              <th className={th}>Teams</th>
              <th className={th}>Result</th>
              <th className={`hidden xl:table-cell ${th}`}>Type</th>
              <th className={`hidden sm:table-cell ${th}`}>Competition</th>
              <th className={`hidden xl:table-cell ${th}`}>Voting Status</th>
              <th className={`hidden sm:table-cell ${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-accent/10">
            {rows.map((match) => {
              const season = seasonOf(match.id);
              const closed = season.endedAt !== null;
              return (
                <React.Fragment key={match.id}>
                  <tr className={`transition-colors hover:bg-accent/5 ${expanded === match.id ? "bg-accent/10" : ""}`} onClick={() => toggle(match.id)}>
                    <td className="whitespace-nowrap px-2 py-3 text-sm text-gray-300 md:px-4 md:py-4">{match.date ? formatDate(match.date) : "TBD"}</td>
                    {showSeasonColumn && (
                      <td className="whitespace-nowrap px-2 py-3 text-sm md:px-4 md:py-4">
                        <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${closed ? "bg-gray-800/60 text-gray-400" : "bg-green-900/40 text-green-400"}`}>
                          S{season.number}
                        </span>
                      </td>
                    )}
                    <td className="whitespace-nowrap px-2 py-3 text-sm font-medium text-accent md:px-4 md:py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <span className="truncate">{match.teams[0]}</span>
                        <span className="hidden sm:inline">vs</span>
                        <span className="truncate">{match.teams[1]}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-sm text-gray-300 md:px-4 md:py-4">
                      {match.scores[0]} - {match.scores[1]}
                    </td>
                    <td className="hidden whitespace-nowrap px-2 py-3 text-sm text-gray-300 md:px-4 md:py-4 xl:table-cell">{convertMatchType(match.matchType)}</td>
                    <td className="hidden whitespace-nowrap px-2 py-3 text-sm text-gray-300 sm:table-cell md:px-4 md:py-4">
                      <div className="flex items-center gap-2">
                        <div className="max-w-[100px] truncate text-sm font-bold text-gray-200 sm:max-w-[180px] md:max-w-[250px]">{match.competitionName}</div>
                        {match.isAdmin && <Shield size={14} className="flex-shrink-0 text-amber-500" />}
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap px-2 py-3 text-sm text-gray-300 md:px-4 md:py-4 xl:table-cell">
                      <span className="text-2xs inline-flex items-center rounded bg-green-900/30 px-1.5 py-0.5 font-medium text-green-400 md:text-xs">Voting Closed</span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-right text-sm md:px-4 md:py-4">
                      <div className="flex items-center justify-end gap-2">
                        {closed ? (
                          <ClosedSeasonBadge season={season} size="xs" />
                        ) : (
                          match.votingStatus === "OPEN" &&
                          match.votingEnabled && (
                            <Button className="rounded-full bg-amber-500/20 p-1 text-amber-400 hover:bg-amber-500/30 md:p-1.5" aria-label="Vote on this match">
                              <CheckSquare size={16} />
                            </Button>
                          )
                        )}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(match.id);
                          }}
                          className="rounded-full bg-accent/20 p-1 text-accent hover:bg-accent/30 md:p-1.5"
                          aria-label={expanded === match.id ? "Collapse details" : "Expand details"}
                        >
                          {expanded === match.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expanded === match.id && (
                    <tr>
                      <td colSpan={showSeasonColumn ? 8 : 7} className="border-b border-accent/20 p-0">
                        <MatchDetails match={match} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
