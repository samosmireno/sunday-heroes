/**
 * PROTOTYPE — throwaway. Variant B — Progress meter.
 *
 * Discloses everything, everywhere. The player is told the threshold, how far
 * along they are, and that the count is per-Season; the matches list carries
 * the same counter; the admin's pending list keeps ineligible players visible
 * with their progress in place of the Vote button. Kind to a genuine
 * newcomer — and it tells a brought-along friend exactly how many appearances
 * a vote costs.
 */
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Panel } from "./shell";
import {
  COMPETITION,
  MATCH_ROWS,
  PENDING_VOTERS,
  REMAINING,
  THRESHOLD,
  VIEWER,
} from "./prototype-data";

export const name = "Progress meter";

function Meter({ played, className = "" }: { played: number; className?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-bg ${className}`}>
      <div
        className="h-full rounded-full bg-accent"
        style={{ width: `${(played / THRESHOLD) * 100}%` }}
      />
    </div>
  );
}

export function VotePage() {
  return (
    <Panel>
      <div className="mx-auto flex max-w-lg flex-col items-center space-y-5 text-center">
        <Lock className="h-10 w-10 text-accent" />
        <h2 className="text-xl font-bold text-accent">
          {REMAINING} more {REMAINING === 1 ? "match" : "matches"} and you can vote
        </h2>
        <div className="w-full space-y-2">
          <Meter played={VIEWER.playedThisSeason} />
          <p className="text-sm font-semibold text-gray-200">
            {VIEWER.playedThisSeason} of {THRESHOLD} matches · Season{" "}
            {VIEWER.currentSeason}
          </p>
        </div>
        <p className="text-sm text-gray-300">
          {COMPETITION.name} opens voting to players who have played{" "}
          {THRESHOLD} matches in a single season. Your {VIEWER.playedLastSeason}{" "}
          matches in Season {VIEWER.currentSeason - 1} don&apos;t carry over.
        </p>
        <p className="text-sm text-gray-400">
          You&apos;re still on the ballot — the others can vote for you.
        </p>
        <Button className="w-fit transform rounded-lg border-2 border-accent/50 bg-accent/20 px-4 py-2 text-accent shadow-md hover:bg-accent/30">
          Back to Dashboard
        </Button>
      </div>
    </Panel>
  );
}

export function MatchesList() {
  return (
    <Panel>
      <table className="min-w-full divide-y divide-accent/30">
        <thead>
          <tr className="border-b-2 border-accent/50">
            {["Date", "Teams", "Result", "Voting Status", "Actions"].map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-accent last:text-right"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-accent/10">
          {MATCH_ROWS.map((m) => (
            <tr key={m.id}>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-300">
                {m.date}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-accent">
                {m.teams[0]} vs {m.teams[1]}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-300">
                {m.scores[0]} - {m.scores[1]}
              </td>
              <td className="whitespace-nowrap px-4 py-4">
                {m.votingStatus === "OPEN" ? (
                  <span className="inline-flex items-center rounded bg-amber-900/30 px-1.5 py-0.5 text-xs font-medium text-amber-400">
                    {m.pendingVotes} pending votes
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded bg-green-900/30 px-1.5 py-0.5 text-xs font-medium text-green-400">
                    Voting Closed
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                {m.votingStatus === "OPEN" && m.viewerPlayed ? (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full bg-bg/60 px-2 py-1 text-xs font-semibold text-gray-300"
                    title={`Play ${REMAINING} more matches in Season ${VIEWER.currentSeason} to vote`}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    {VIEWER.playedThisSeason}/{THRESHOLD} to vote
                  </span>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

export function PendingVotes() {
  return (
    <Panel>
      <h2 className="mb-6 text-xl font-bold text-accent">Pending Player Votes</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-accent/30 text-left text-gray-300">
            <th className="p-3">Player Name</th>
            <th className="p-3">Season {VIEWER.currentSeason}</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {PENDING_VOTERS.filter((v) => !v.voted).map((v) => (
            <tr key={v.playerId} className="border-b border-accent/10">
              <td className="p-3 font-medium text-accent">{v.playerName}</td>
              <td className="w-48 p-3">
                {v.eligible ? (
                  <span className="inline-flex items-center rounded bg-green-900/30 px-1.5 py-0.5 text-xs font-medium text-green-400">
                    Eligible
                  </span>
                ) : (
                  <>
                    <Meter played={v.playedThisSeason} />
                    <span className="text-xs text-gray-400">
                      {v.playedThisSeason} of {THRESHOLD} matches
                    </span>
                  </>
                )}
              </td>
              <td className="p-3">
                {v.eligible ? (
                  <Button className="bg-accent/20 p-3 text-accent hover:bg-accent/30">
                    Vote
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                    <Lock className="h-3.5 w-3.5" />
                    Not eligible yet
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
