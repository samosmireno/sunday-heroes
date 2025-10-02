import { CreateCompetitionFormValues } from "./create-competition-schema";

export const transformCompetitionFormToRequest = (
  data: CreateCompetitionFormValues,
  userId: string,
) => {
  const competitionRequest = {
    userId: userId,
    type: data.type,
    name: data.name,
    trackSeasons: data.trackSeasons,
    votingEnabled: data.votingEnabled,
    currentSeason: 1,
    minPlayers: 4,
    votingPeriodDays: data.votingPeriodDays ?? undefined,
    knockoutVotingPeriodDays: data.knockoutVotingPeriodDays ?? undefined,
    reminderDays: data.reminderDays ?? undefined,
    isRoundRobin: data.isRoundRobin ?? false,
    numberOfTeams: data.numberOfTeams ?? undefined,
    matchType: data.matchType ?? undefined,
  };

  return competitionRequest;
};
