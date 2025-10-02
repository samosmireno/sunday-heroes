import axiosInstance from "@/config/axios-config";
import {
  MatchFormData,
  LeagueFormData,
} from "@/features/add-match-form/add-match-schemas";
import { CompetitionType } from "@repo/shared-types";
import { config } from "@/config/config";
import {
  transformDuelFormToRequest,
  transformLeagueFormToRequest,
} from "../utils/request-transform";

export const matchService = {
  createMatch: async (
    data: MatchFormData,
    competitionId: string,
    competitionType: CompetitionType,
  ) => {
    const reqData =
      competitionType === CompetitionType.DUEL
        ? transformDuelFormToRequest(data, competitionId)
        : transformLeagueFormToRequest(data as LeagueFormData, competitionId);

    return axiosInstance.post(`${config.server}/api/matches`, reqData, {
      withCredentials: true,
    });
  },

  updateMatch: async (
    matchId: string,
    data: MatchFormData,
    competitionId: string,
    competitionType: CompetitionType,
  ) => {
    const reqData =
      competitionType === CompetitionType.DUEL
        ? transformDuelFormToRequest(data, competitionId)
        : transformLeagueFormToRequest(data as LeagueFormData, competitionId);

    return axiosInstance.put(
      `${config.server}/api/matches/${matchId}`,
      reqData,
      {
        withCredentials: true,
      },
    );
  },
};
