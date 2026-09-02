// PROTOTYPE — throwaway. Builds the fake season model for a competition.
// `?proto=league` fabricates a League on any competition (the production
// database has no League to host the prototype); `?state=setup` empties the
// Current season; `?role=admin|moderator|player` overrides the viewer's role.
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { CompetitionResponse, CompetitionType, Role } from "@repo/shared-types";
import { buildDuelModel, buildLeagueModel } from "./fake-seasons";

const ROLES: Record<string, Role> = {
  admin: Role.ADMIN,
  moderator: Role.MODERATOR,
  player: Role.PLAYER,
};

export function useProtoModel(competition: CompetitionResponse) {
  const [searchParams] = useSearchParams();
  const proto = searchParams.get("proto");
  const state = searchParams.get("state") === "setup" ? "setup" : "normal";
  const role = ROLES[searchParams.get("role") ?? ""] ?? competition.userRole;
  const asLeague = proto === "league" || (proto !== "duel" && competition.type === CompetitionType.LEAGUE);

  const model = useMemo(
    () => (asLeague ? buildLeagueModel(competition.id, role, state) : buildDuelModel(competition, role)),
    [asLeague, competition, role, state],
  );

  return { model, state, extra: `${asLeague ? "League" : "Duel"} · ${role.toLowerCase()}${state === "setup" ? " · setup" : ""}` };
}
