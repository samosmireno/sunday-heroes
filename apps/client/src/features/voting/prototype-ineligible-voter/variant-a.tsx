/**
 * PROTOTYPE — throwaway. Variant A — Silent gate.
 *
 * Discloses nothing. An ineligible player is never offered a vote and never
 * told a threshold exists: no button on the matches list, a flat refusal on
 * the vote page, and no row in the admin's pending list. The threshold stays
 * the admin's business, so a brought-along friend learns nothing about how
 * many appearances would buy a vote.
 */
import { Button } from "@/components/ui/button";
import { Panel } from "./shell";
import { COMPETITION, MATCH_ROWS, PENDING_VOTERS } from "./prototype-data";

export const name = "Silent gate";

export function VotePage() {
  return (
    <Panel>
      <div className="flex flex-col items-center space-y-4 text-center">
        <h2 className="text-xl font-bold text-accent">Voting</h2>
        <p className="max-w-md text-gray-200">
          Voting isn&apos;t open to you in {COMPETITION.name}.
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
              {/* No vote action at all — the affordance simply never appears. */}
              <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-500">
                —
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

export function PendingVotes() {
  const listed = PENDING_VOTERS.filter((v) => v.eligible);
  return (
    <Panel>
      <h2 className="mb-6 text-xl font-bold text-accent">Pending Player Votes</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-accent/30 text-left text-gray-300">
            <th className="p-3">Player Name</th>
            <th className="p-3">Match</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {listed.map((v) => (
            <tr key={v.playerId} className="border-b border-accent/10">
              <td className="p-3 font-medium text-accent">{v.playerName}</td>
              <td className="p-3 text-gray-300">Lions vs Tigers (3 - 2)</td>
              <td className="p-3">
                {!v.voted && (
                  <Button className="bg-accent/20 p-3 text-accent hover:bg-accent/30">
                    Vote
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Ineligible players are simply not here — the admin is not told they exist. */}
    </Panel>
  );
}
