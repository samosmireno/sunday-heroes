import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Lock,
  Shield,
} from "lucide-react";
import { MatchDetails } from "./match-details";
import { MatchPageResponse, VoterEligibility } from "@repo/shared-types";
import { formatDate } from "@/utils/string";
import { convertMatchType } from "@/utils/string";
import React from "react";
import { Button } from "@/components/ui/button";
import { seasonName } from "@/features/competition/season-labels";
import ClosedSeasonLock from "@/features/competition/closed-season-lock";
import { thresholdTooltip } from "@/features/voting/threshold-copy";

interface MatchesListProps {
  matches: MatchPageResponse[];
  /** Under All seasons, a Season column says which season each match belongs to. */
  showSeason?: boolean;
}

/** A column of the table: its heading, and the classes that align it and hide it on narrow screens. */
interface Column {
  label: string;
  className: string;
}

/**
 * The table's columns in order, a Season column among them under All
 * seasons. The heading row maps over them and the expanded details row spans
 * their count, so the two cannot drift apart.
 */
const columnsOf = (showSeason: boolean): Column[] => [
  { label: "Date", className: "text-left" },
  { label: "Teams", className: "text-left" },
  { label: "Result", className: "text-left" },
  ...(showSeason ? [{ label: "Season", className: "text-left" }] : []),
  { label: "Type", className: "hidden text-left xl:table-cell" },
  { label: "Competition", className: "hidden text-left sm:table-cell" },
  { label: "Voting Status", className: "hidden text-left xl:table-cell" },
  { label: "Actions", className: "hidden text-right sm:table-cell" },
];

/**
 * The vote affordance for a viewer the armed Voting gate has shut out. It
 * stays in the cell rather than disappearing — a button that vanishes reads as
 * a bug, not as a rule — disabled, carrying the viewer's Current-season
 * progress and the rule that produced it.
 *
 * Only ever rendered when `canVote` is false, which the gate answers only once
 * it is armed and the viewer has not qualified. So the counter never shows on
 * its own during the runway, where it would be a number about a rule that is
 * not yet in force — and only on a match the viewer played, since a
 * non-participant has no ballot on it to be shut out of.
 *
 * The title sits on the wrapping span deliberately: a disabled button carries
 * `pointer-events: none`, so a title on the button itself never surfaces.
 */
function BlockedVoteAffordance({
  eligibility,
}: {
  eligibility: VoterEligibility;
}) {
  const { threshold, matchesThisSeason } = eligibility;

  return (
    <span title={thresholdTooltip(eligibility, "viewer")}>
      <Button
        disabled
        className="text-2xs h-7 gap-1 rounded-full bg-gray-500/20 px-2 py-1 font-medium text-gray-400 md:text-xs"
        aria-label="You cannot vote on this match yet"
      >
        <Lock size={14} aria-hidden="true" />
        {matchesThisSeason}/{threshold} to vote
      </Button>
    </span>
  );
}

export default function MatchesList({
  matches,
  showSeason = false,
}: MatchesListProps) {
  const navigate = useNavigate();
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const columns = columnsOf(showSeason);

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
    } else if (match.date === undefined) {
      return (
        <span className="text-2xs inline-flex items-center rounded bg-amber-900/30 px-1.5 py-0.5 font-medium text-amber-400 md:text-xs">
          Post-Match
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
          {match.pendingVotes} pending vote{match.pendingVotes === 1 ? "" : "s"}
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
              {columns.map((column) => (
                <th
                  key={column.label}
                  scope="col"
                  className={`whitespace-nowrap px-2 py-2 text-xs font-bold uppercase tracking-wider text-accent md:px-4 md:py-3 ${column.className}`}
                >
                  {column.label}
                </th>
              ))}
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                      <span className="truncate">{match.teams[0]}</span>
                      <span className="hidden sm:inline">vs</span>
                      <span className="truncate">{match.teams[1]}</span>
                    </div>
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
                  {showSeason && (
                    <td className="whitespace-nowrap px-2 py-3 text-sm md:px-4 md:py-4">
                      <span className="rounded bg-bg/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent/80">
                        {seasonName(match.season.number)}
                      </span>
                    </td>
                  )}
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
                    <div className="flex items-center justify-end space-x-1 md:space-x-2">
                      {/* A Past season's match is history (ADR 0002); voting open at the rollover runs on. */}
                      {match.season.isClosed && (
                        <ClosedSeasonLock seasonNumber={match.season.number} />
                      )}
                      {/* The affordance shows on an open match exactly as it always
                          has; the Voting gate decides only whether it is usable.
                          An admin keeps the live link whatever their own standing:
                          this button is the only route to the on-behalf-of list
                          (`/pending/:matchId`), and the gate is about the standing
                          of the player a ballot is cast for, never the rights of
                          whoever is asking.

                          The lock, though, is scoped to a match the viewer
                          played. A blocked non-participant is not waiting for
                          anything on this match — they never had a ballot on
                          it — so the slot stays empty rather than carrying a
                          Current-season counter about a match they were never
                          on. */}
                      {match.votingStatus === "OPEN" &&
                        match.votingEnabled &&
                        (match.isAdmin || match.viewerEligibility.canVote ? (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/pending/${match.id}`);
                            }}
                            className="rounded-full bg-amber-500/20 p-1 text-amber-400 hover:bg-amber-500/30 md:p-1.5"
                            aria-label="Vote on this match"
                            title="Vote on this match"
                          >
                            <CheckSquare size={16} />
                          </Button>
                        ) : (
                          match.viewerPlayed && (
                            <BlockedVoteAffordance
                              eligibility={match.viewerEligibility}
                            />
                          )
                        ))}
                      {/* <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-match/${match.id}`);
                        }}
                        className="rounded-full bg-amber-500/20 p-1 text-amber-400 hover:bg-amber-500/30 md:p-1.5"
                        aria-label="Edit this match"
                        title="Edit this match"
                      >
                        <i className="fa-solid fa-pen-to-square" />
                      </Button> */}

                      <Button
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
                      </Button>
                    </div>
                  </td>
                </tr>

                {expandedMatchId === match.id && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="border-b border-accent/20 p-0"
                    >
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
