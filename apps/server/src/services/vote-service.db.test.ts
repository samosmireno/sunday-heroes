import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDuelWithClosedSeason,
  createRegisteredPlayer,
  createUserWithDashboard,
} from "../../test/factories";
import { EmailService } from "./email-service";
import { VoteService } from "./vote-service";

describe("Voting is not a Match write (ADR 0002)", () => {
  // Creating a Match with voting enabled sends the invitation to every player
  // with an email, over SMTP: an external boundary, stubbed here.
  beforeEach(() => {
    vi.spyOn(EmailService, "sendVotingInvitation").mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts a vote on a Season-1 Match whose voting is still open after the rollover", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    // Ana, one of the default Duel players, has an account and votes as herself.
    const ana = await createRegisteredPlayer({
      dashboardId: dashboard.id,
      nickname: "Ana",
    });
    const { seasonOneMatch } = await createDuelWithClosedSeason({
      userId: user.id,
      votingEnabled: true,
    });
    const voterId = ana.dashboardPlayer.id;
    const before = await VoteService.getVotingStatus(
      seasonOneMatch.id,
      voterId,
    );
    expect(before).toMatchObject({ votingOpen: true, hasVoted: false });
    const [first, second, third] = before.players.filter(
      (player) => player.canVoteFor,
    );

    const result = await VoteService.submitVotes(
      seasonOneMatch.id,
      voterId,
      [
        { playerId: first.id, points: 3 },
        { playerId: second.id, points: 2 },
        { playerId: third.id, points: 1 },
      ],
      ana.user.id,
    );

    expect(result.success).toBe(true);
    expect(
      (await VoteService.getVotingStatus(seasonOneMatch.id, voterId)).hasVoted,
    ).toBe(true);
  });
});
