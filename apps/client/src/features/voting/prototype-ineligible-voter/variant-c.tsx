/**
 * PROTOTYPE — throwaway. Variant C — Regulars only.
 *
 * Frames the gate as a status you earn rather than a countdown you complete.
 * The player is not turned away: the vote page still shows the ballot, read
 * only, with the submit replaced by the status note — so they see what voting
 * looks like and that they are on the ballot themselves. No count and no
 * target anywhere, so the exact price of a vote stays undisclosed.
 */
import { Button } from "@/components/ui/button";
import { Lock, Users } from "lucide-react";
import { Panel } from "./shell";
import { BALLOT, COMPETITION, MATCH, MATCH_ROWS, PENDING_VOTERS } from "./prototype-data";

export const name = "Regulars only";

function BallotColumn({ isHome }: { isHome: boolean }) {
  return (
    <div>
      <h3 className="mb-3 border-b border-accent/30 pb-1 text-sm font-bold uppercase tracking-wider text-gray-400">
        {isHome ? "Home Team" : "Away Team"}
      </h3>
      <div className="space-y-2">
        {BALLOT.filter((p) => p.isHome === isHome).map((p) => (
          <div
            key={p.id}
            className="cursor-not-allowed rounded-lg border-2 border-gray-600/40 bg-bg/40 p-3 opacity-50"
          >
            <span className="font-medium text-gray-400">{p.nickname}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VotePage() {
  return (
    <Panel>
      <div className="mb-5 rounded-lg border-2 border-accent/60 bg-accent/10 p-4">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <h2 className="font-bold text-accent">
              Voting in {COMPETITION.name} is for the regulars
            </h2>
            <p className="mt-1 text-sm text-gray-300">
              Keep turning up this season and it opens up for you. Until then
              you&apos;re on the ballot like everyone else — the regulars can
              still vote for you.
            </p>
          </div>
        </div>
      </div>
      <h3 className="mb-4 text-lg font-bold text-gray-400">
        {MATCH.teams[0]} {MATCH.scores[0]} - {MATCH.scores[1]} {MATCH.teams[1]}
      </h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <BallotColumn isHome />
        <BallotColumn isHome={false} />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-accent/20 pt-4">
        <span className="inline-flex items-center gap-2 text-sm text-gray-400">
          <Lock className="h-4 w-4" />
          You can&apos;t submit votes yet
        </span>
        <Button className="transform rounded-lg border-2 border-accent/50 bg-accent/20 px-4 py-2 text-accent shadow-md hover:bg-accent/30">
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
                {/* The affordance stays, disabled — the match is still openable to read. */}
                {m.votingStatus === "OPEN" && m.viewerPlayed ? (
                  <span
                    className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full bg-gray-600/20 px-2.5 py-1.5 text-xs text-gray-400"
                    title="Voting is for the regulars"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Vote
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
  const waiting = PENDING_VOTERS.filter((v) => !v.voted && v.eligible);
  const notVoting = PENDING_VOTERS.filter((v) => !v.eligible);
  return (
    <Panel>
      <h2 className="mb-4 text-xl font-bold text-accent">Waiting on</h2>
      <table className="w-full border-collapse">
        <tbody>
          {waiting.map((v) => (
            <tr key={v.playerId} className="border-b border-accent/10">
              <td className="p-3 font-medium text-accent">{v.playerName}</td>
              <td className="p-3 text-right">
                <Button className="bg-accent/20 p-3 text-accent hover:bg-accent/30">
                  Vote
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="mb-2 mt-8 text-sm font-bold uppercase tracking-wider text-gray-400">
        Not voting in this competition yet
      </h2>
      <p className="mb-3 text-xs text-gray-500">
        These players are on the ballot but haven&apos;t become regulars yet.
      </p>
      <div className="flex flex-wrap gap-2">
        {notVoting.map((v) => (
          <span
            key={v.playerId}
            className="inline-flex items-center gap-1.5 rounded-full bg-bg/60 px-3 py-1 text-sm text-gray-400"
          >
            <Lock className="h-3.5 w-3.5" />
            {v.playerName}
          </span>
        ))}
      </div>
    </Panel>
  );
}
