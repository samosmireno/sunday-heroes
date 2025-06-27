import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckSquare, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { MatchDetails } from "./match-details";
import { MatchPageResponse } from "@repo/logger";
import { formatDate } from "../../../utils/utils";
import { convertMatchType } from "../../../types/types";
import React from "react";

interface MatchesListProps {
  matches: MatchPageResponse[];
}

export default function MatchesList({ matches }: MatchesListProps) {
  const navigate = useNavigate();
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const toggleExpand = (matchId: string) => {
    setExpandedMatchId(expandedMatchId === matchId ? null : matchId);
  };

  const getVotingStatusBadge = (match: MatchPageResponse) => {
    if (match.votingEnabled === false) {
      return (
        <span className="text-2xs inline-flex items-center rounded bg-blue-900/30 px-1.5 py-0.5 font-medium text-red-400 md:text-xs">
          Voting Disabled
        </span>
      );
    } else if (match.votingStatus === "CLOSED") {
      return (
        <span className="text-2xs inline-flex items-center rounded bg-green-900/30 px-1.5 py-0.5 font-medium text-green-400 md:text-xs">
          Voting Closed
        </span>
      );
    } else if (match.votingStatus === "OPEN") {
      return (
        <span className="text-2xs inline-flex items-center rounded bg-amber-900/30 px-1.5 py-0.5 font-medium text-amber-400 md:text-xs">
          {match.pendingVotes} pending votes
        </span>
      );
    } else {
      return (
        <span className="text-2xs inline-flex items-center rounded bg-blue-900/30 px-1.5 py-0.5 font-medium text-red-400 md:text-xs">
          Voting Disabled
        </span>
      );
    }
  };

  return (
    <div className="relative mx-0">
      <div className="overflow-x-auto pb-2">
        <table className="min-w-full divide-y divide-accent/30">
          <thead>
            <tr className="border-b-2 border-accent/50">
              <th
                scope="col"
                className="whitespace-nowrap px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-accent md:px-4 md:py-3"
              >
                Date
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-accent md:px-4 md:py-3"
              >
                Teams
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-accent md:px-4 md:py-3"
              >
                Result
              </th>
              <th
                scope="col"
                className="hidden whitespace-nowrap px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-accent md:px-4 md:py-3 xl:table-cell"
              >
                Type
              </th>
              <th
                scope="col"
                className="hidden whitespace-nowrap px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-accent sm:table-cell md:px-4 md:py-3"
              >
                Competition
              </th>
              <th
                scope="col"
                className="hidden whitespace-nowrap px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-accent md:px-4 md:py-3 xl:table-cell"
              >
                Voting Status
              </th>
              <th
                scope="col"
                className="hidden whitespace-nowrap px-2 py-2 text-right text-xs font-bold uppercase tracking-wider text-accent sm:table-cell md:px-4 md:py-3"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-accent/10">
            {matches.map((match) => (
              <React.Fragment key={match.id}>
                <tr
                  key={match.id}
                  className={`transition-colors hover:bg-accent/5 ${
                    expandedMatchId === match.id ? "bg-accent/10" : ""
                  }`}
                  onClick={() => toggleExpand(match.id)}
                >
                  <td className="whitespace-nowrap px-2 py-3 text-sm text-gray-300 md:px-4 md:py-4">
                    {match.date ? formatDate(match.date) : "TBD"}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-sm font-medium text-accent md:px-4 md:py-4">
                    {match.teams[0]} vs {match.teams[1]}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-sm text-gray-300 md:px-4 md:py-4">
                    <div>
                      {match.scores[0]} - {match.scores[1]}
                      {match.penaltyScores && (
                        <span className="ml-2 text-xs text-gray-400">
                          (pen: {match.penaltyScores[0]} -{" "}
                          {match.penaltyScores[1]})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-2 py-3 text-sm text-gray-300 md:px-4 md:py-4 xl:table-cell">
                    {convertMatchType(match.matchType)}
                  </td>
                  <td className="hidden whitespace-nowrap px-2 py-3 text-sm text-gray-300 sm:table-cell md:px-4 md:py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="max-w-[100px] truncate text-sm font-bold text-gray-200 sm:max-w-[180px] md:max-w-[250px]"
                        title={match.competitionName}
                      >
                        {match.competitionName}
                      </div>
                      {match.isAdmin && (
                        <Shield
                          size={14}
                          className="flex-shrink-0 text-amber-500"
                        />
                      )}
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-2 py-3 text-sm text-gray-300 md:px-4 md:py-4 xl:table-cell">
                    {getVotingStatusBadge(match)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-right text-sm md:px-4 md:py-4">
                    <div className="flex justify-end space-x-1 md:space-x-2">
                      {match.votingStatus === "OPEN" && match.votingEnabled && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/pending/${match.id}`);
                          }}
                          className="rounded-full bg-amber-500/20 p-1 text-amber-400 hover:bg-amber-500/30 md:p-1.5"
                          aria-label="Vote on this match"
                          title="Vote on this match"
                        >
                          <CheckSquare size={16} />
                        </button>
                      )}
                      {/* <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-match/${match.id}`);
                        }}
                        className="rounded-full bg-amber-500/20 p-1 text-amber-400 hover:bg-amber-500/30 md:p-1.5"
                        aria-label="Edit this match"
                        title="Edit this match"
                      >
                        <i className="fa-solid fa-pen-to-square" />
                      </button> */}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(match.id);
                        }}
                        className="rounded-full bg-accent/20 p-1 text-accent hover:bg-accent/30 md:p-1.5"
                        aria-label={
                          expandedMatchId === match.id
                            ? "Collapse details"
                            : "Expand details"
                        }
                        title={
                          expandedMatchId === match.id
                            ? "Collapse details"
                            : "Expand details"
                        }
                      >
                        {expandedMatchId === match.id ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>

                {expandedMatchId === match.id && (
                  <tr>
                    <td colSpan={6} className="border-b border-accent/20 p-0">
                      <div className="transition-all">
                        <MatchDetails match={match} />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
