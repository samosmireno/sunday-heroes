// PROTOTYPE — throwaway. Fakes the Season model on the client so the
// selector UX can be judged before the API exists. Seasons are derived from
// the real Duel matches (split by date into thirds) or fabricated for League.
import {
  CompetitionResponse,
  CompetitionType,
  LeagueMatchResponse,
  LeaguePlayerTotals,
  MatchPageResponse,
  MatchResponse,
  MatchType,
  PlayerResponse,
  PlayerTotals,
  Role,
  VotingStatus,
} from "@repo/shared-types";

export interface ProtoSeason {
  number: number;
  startedAt: string;
  endedAt: string | null;
}

export type SeasonSelection = number | "all";

export interface ProtoMatch {
  id: string;
  seasonNumber: number;
  date: string | null;
  round: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  isCompleted: boolean;
  matchType: MatchType;
  players: PlayerResponse[];
  videoUrl?: string;
  votingStatus: VotingStatus;
  pendingVotes: number;
}

export interface ProtoModel {
  id: string;
  name: string;
  type: CompetitionType;
  votingEnabled: boolean;
  userRole: Role;
  seasons: ProtoSeason[];
  matches: ProtoMatch[];
  teams: string[];
}

export interface StandingsRow {
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

// ---------- season helpers ----------

export const currentSeason = (model: ProtoModel): ProtoSeason =>
  model.seasons.find((s) => s.endedAt === null) ?? model.seasons[0];

export const seasonByNumber = (
  model: ProtoModel,
  number: number,
): ProtoSeason | undefined => model.seasons.find((s) => s.number === number);

export const isPastSelection = (
  model: ProtoModel,
  selection: SeasonSelection,
): boolean =>
  selection !== "all" && seasonByNumber(model, selection)?.endedAt != null;

export const selectionSeason = (
  model: ProtoModel,
  selection: SeasonSelection,
): ProtoSeason | null =>
  selection === "all" ? null : (seasonByNumber(model, selection) ?? null);

export const matchesFor = (
  model: ProtoModel,
  selection: SeasonSelection,
): ProtoMatch[] =>
  selection === "all"
    ? model.matches
    : model.matches.filter((m) => m.seasonNumber === selection);

export const formatDay = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatMonth = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });

export const seasonDates = (s: ProtoSeason): string =>
  s.endedAt
    ? `${formatDay(s.startedAt)} – ${formatDay(s.endedAt)}`
    : `since ${formatDay(s.startedAt)}`;

export const seasonShortDates = (s: ProtoSeason): string =>
  s.endedAt
    ? `${formatMonth(s.startedAt)} – ${formatMonth(s.endedAt)}`
    : `since ${formatMonth(s.startedAt)}`;

export const seasonLabel = (s: ProtoSeason): string =>
  `Season ${s.number} · ${seasonDates(s)}`;

// Compact label for a closed select trigger.
export const selectionLabel = (
  model: ProtoModel,
  selection: SeasonSelection,
): string => {
  if (selection === "all") return "All seasons";
  const s = seasonByNumber(model, selection);
  if (!s) return `Season ${selection}`;
  return s.endedAt === null
    ? `Season ${s.number} · current`
    : `Season ${s.number} · ${seasonShortDates(s)}`;
};

export const selectionTitle = (
  _model: ProtoModel,
  selection: SeasonSelection,
): string =>
  selection === "all" ? "All seasons" : `Season ${selection}`;

// ---------- deterministic randomness ----------

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Duel: real matches, fake seasons ----------

const addDays = (iso: string, days: number): string => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};

export function buildDuelModel(
  competition: CompetitionResponse,
  role: Role,
): ProtoModel {
  const dated = competition.matches
    .filter((m) => !!m.date)
    .sort(
      (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime(),
    );
  const undated = competition.matches.filter((m) => !m.date);

  const seasonCount = dated.length >= 6 ? 3 : 1;
  const chunk = Math.ceil(dated.length / seasonCount);
  const chunks: MatchResponse[][] = [];
  for (let i = 0; i < seasonCount; i++) {
    chunks.push(dated.slice(i * chunk, (i + 1) * chunk));
  }

  const seasons: ProtoSeason[] = [];
  for (let i = 0; i < seasonCount; i++) {
    const first = chunks[i][0]?.date ?? new Date().toISOString();
    const startedAt =
      i === 0 ? addDays(first, -14) : seasons[i - 1].endedAt!;
    const last = chunks[i][chunks[i].length - 1]?.date ?? first;
    const endedAt = i < seasonCount - 1 ? addDays(last, 1) : null;
    seasons.push({ number: i + 1, startedAt, endedAt });
  }

  const matches: ProtoMatch[] = [];
  chunks.forEach((list, i) =>
    list.forEach((m) => matches.push(fromMatchResponse(m, i + 1))),
  );
  undated.forEach((m) =>
    matches.push(fromMatchResponse(m, seasonCount)),
  );

  return {
    id: competition.id,
    name: competition.name,
    type: CompetitionType.DUEL,
    votingEnabled: competition.votingEnabled,
    userRole: role,
    seasons,
    matches,
    teams: ["Home", "Away"],
  };
}

function fromMatchResponse(m: MatchResponse, seasonNumber: number): ProtoMatch {
  return {
    id: m.id,
    seasonNumber,
    date: m.date ?? null,
    round: m.round,
    homeTeam: m.teams[0] ?? "Home",
    awayTeam: m.teams[1] ?? "Away",
    homeScore: m.homeTeamScore,
    awayScore: m.awayTeamScore,
    isCompleted: m.isCompleted,
    matchType: m.matchType,
    players: m.players,
    videoUrl: m.videoUrl,
    votingStatus: VotingStatus.CLOSED,
    pendingVotes: 0,
  };
}

// ---------- League: fully fabricated ----------

const LEAGUE_TEAMS = [
  "Wolves",
  "Falcons",
  "Rhinos",
  "Sharks",
  "Eagles",
  "Tigers",
];

const NICKNAMES = [
  "Marko", "Luka", "Nikola", "Stefan", "Milan",
  "Dušan", "Filip", "Petar", "Vuk", "Aleksa",
  "Uroš", "Lazar", "Jovan", "Miloš", "Nemanja",
  "Đorđe", "Bogdan", "Andrej", "Ognjen", "Veljko",
  "Mateja", "Vasilije", "Strahinja", "Danilo", "Pavle",
  "Relja", "Dimitrije", "Teodor", "Kosta", "Vukašin",
];

export type LeagueProtoState = "normal" | "setup";

const LEAGUE_SEASONS: ProtoSeason[] = [
  { number: 1, startedAt: "2024-09-08T10:00:00.000Z", endedAt: "2025-03-02T10:00:00.000Z" },
  { number: 2, startedAt: "2025-03-02T10:00:00.000Z", endedAt: "2025-09-14T10:00:00.000Z" },
  { number: 3, startedAt: "2025-09-14T10:00:00.000Z", endedAt: null },
];

// circle method, single round-robin for an even team count
function roundRobin(teams: string[]): [string, string][][] {
  const list = [...teams];
  const rounds: [string, string][][] = [];
  const n = list.length;
  for (let r = 0; r < n - 1; r++) {
    const pairs: [string, string][] = [];
    for (let i = 0; i < n / 2; i++) {
      const home = list[i];
      const away = list[n - 1 - i];
      pairs.push(r % 2 === 0 ? [home, away] : [away, home]);
    }
    rounds.push(pairs);
    list.splice(1, 0, list.pop()!);
  }
  return rounds;
}

function fabricatePlayers(
  rand: () => number,
  home: string,
  away: string,
  homeScore: number,
  awayScore: number,
  completed: boolean,
): PlayerResponse[] {
  const squad = (team: string, isHome: boolean, goals: number) => {
    const teamIndex = LEAGUE_TEAMS.indexOf(team);
    const names = NICKNAMES.slice(teamIndex * 5, teamIndex * 5 + 5);
    const players: PlayerResponse[] = names.map((nickname, i) => ({
      id: `${team}-${nickname}`.toLowerCase(),
      nickname,
      isHome,
      goals: 0,
      assists: 0,
      position: i + 1,
      rating: completed ? Math.round((5 + rand() * 4) * 10) / 10 : 0,
      manOfTheMatch: false,
    }));
    for (let g = 0; g < goals; g++) {
      players[Math.floor(rand() * 5)].goals += 1;
      if (rand() > 0.35) players[Math.floor(rand() * 5)].assists += 1;
    }
    return players;
  };
  const players = [
    ...squad(home, true, homeScore),
    ...squad(away, false, awayScore),
  ];
  if (completed) {
    const best = players.reduce((p, c) => (c.rating > p.rating ? c : p));
    best.manOfTheMatch = true;
  }
  return players;
}

export function buildLeagueModel(
  id: string,
  role: Role,
  state: LeagueProtoState,
): ProtoModel {
  const rand = mulberry32(20250914);
  const rounds = roundRobin(LEAGUE_TEAMS);
  const matches: ProtoMatch[] = [];

  const build = (
    season: ProtoSeason,
    firstMatchDay: string,
    plan: (round: number, index: number) => "completed" | "scored" | "blank",
  ) => {
    rounds.forEach((pairs, r) => {
      pairs.forEach(([home, away], i) => {
        const kind = plan(r + 1, i);
        const completed = kind === "completed";
        const scored = completed || kind === "scored";
        const homeScore = scored ? Math.floor(rand() * 5) : 0;
        const awayScore = scored ? Math.floor(rand() * 4) : 0;
        matches.push({
          id: `s${season.number}-r${r + 1}-m${i + 1}`,
          seasonNumber: season.number,
          date: kind === "blank" && r >= 3 ? null : addDays(firstMatchDay, r * 7),
          round: r + 1,
          homeTeam: home,
          awayTeam: away,
          homeScore,
          awayScore,
          isCompleted: completed,
          matchType: MatchType.FIVE_A_SIDE,
          players: fabricatePlayers(rand, home, away, homeScore, awayScore, completed),
          videoUrl: completed && rand() > 0.7 ? "https://youtube.com" : undefined,
          votingStatus: VotingStatus.CLOSED,
          pendingVotes: 0,
        });
      });
    });
  };

  // Season 1: everything completed.
  build(LEAGUE_SEASONS[0], "2024-09-15T18:00:00.000Z", () => "completed");
  // Season 2: two fixtures never completed, one with a result entered.
  build(LEAGUE_SEASONS[1], "2025-03-09T18:00:00.000Z", (round, i) =>
    round === 5 && i === 1 ? "scored" : round === 5 && i === 2 ? "blank" : "completed",
  );
  // Season 3 (current): two rounds played, third under way.
  if (state === "normal") {
    build(LEAGUE_SEASONS[2], "2025-09-21T18:00:00.000Z", (round, i) =>
      round <= 2 ? "completed" : round === 3 && i === 0 ? "completed" : round === 3 && i === 1 ? "scored" : "blank",
    );
  }

  return {
    id,
    name: "Sunday League",
    type: CompetitionType.LEAGUE,
    votingEnabled: true,
    userRole: role,
    seasons: LEAGUE_SEASONS,
    matches,
    teams: LEAGUE_TEAMS,
  };
}

// ---------- derived data ----------

export function computeStandings(model: ProtoModel): StandingsRow[] {
  const rows = new Map<string, StandingsRow>();
  model.teams.forEach((name) =>
    rows.set(name, {
      name, played: 0, wins: 0, draws: 0, losses: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
    }),
  );
  const current = currentSeason(model).number;
  model.matches
    .filter((m) => m.seasonNumber === current && m.isCompleted)
    .forEach((m) => {
      const home = rows.get(m.homeTeam)!;
      const away = rows.get(m.awayTeam)!;
      home.played++; away.played++;
      home.goalsFor += m.homeScore; home.goalsAgainst += m.awayScore;
      away.goalsFor += m.awayScore; away.goalsAgainst += m.homeScore;
      if (m.homeScore > m.awayScore) { home.wins++; away.losses++; home.points += 3; }
      else if (m.homeScore < m.awayScore) { away.wins++; home.losses++; away.points += 3; }
      else { home.draws++; away.draws++; home.points++; away.points++; }
    });
  return [...rows.values()]
    .map((r) => ({ ...r, goalDifference: r.goalsFor - r.goalsAgainst }))
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
}

export function computePlayerTotals(matches: ProtoMatch[]): LeaguePlayerTotals[] {
  const map = new Map<
    string,
    LeaguePlayerTotals & { ratingSum: number; ratedMatches: number }
  >();
  matches
    .filter((m) => m.isCompleted)
    .forEach((m) => {
      m.players.forEach((p) => {
        // Real match players carry a per-match id, so the nickname is the key.
        const key = p.nickname;
        const entry =
          map.get(key) ?? {
            id: key, nickname: p.nickname, matches: 0, wins: 0, winRate: 0,
            goals: 0, assists: 0, rating: 0, numManOfTheMatch: 0,
            teamName: p.isHome ? m.homeTeam : m.awayTeam,
            ratingSum: 0, ratedMatches: 0,
          };
        entry.matches++;
        entry.goals += p.goals;
        entry.assists += p.assists;
        const won = p.isHome ? m.homeScore > m.awayScore : m.awayScore > m.homeScore;
        if (won) entry.wins++;
        if (p.rating > 0) { entry.ratingSum += p.rating; entry.ratedMatches++; }
        if (p.manOfTheMatch) entry.numManOfTheMatch = (entry.numManOfTheMatch ?? 0) + 1;
        map.set(key, entry);
      });
    });
  return [...map.values()].map(({ ratingSum, ratedMatches, ...p }) => ({
    ...p,
    winRate: p.matches > 0 ? Number(((p.wins / p.matches) * 100).toFixed(2)) : 0,
    rating: ratedMatches > 0 ? Math.round((ratingSum / ratedMatches) * 100) / 100 : undefined,
  }));
}

export function topPerformers(players: LeaguePlayerTotals[]) {
  if (players.length === 0) return { topScorer: null, topAssister: null, topRated: null };
  const pick = (key: keyof PlayerTotals) =>
    players.reduce((prev, cur) => ((cur[key] as number) || 0) > ((prev[key] as number) || 0) ? cur : prev);
  return { topScorer: pick("goals"), topAssister: pick("assists"), topRated: pick("rating") };
}

// ---------- converters to the shapes the existing components take ----------

export const toLeagueMatch = (m: ProtoMatch): LeagueMatchResponse => ({
  id: m.id,
  homeTeam: { id: m.homeTeam, name: m.homeTeam, score: m.homeScore },
  awayTeam: { id: m.awayTeam, name: m.awayTeam, score: m.awayScore },
  homeScore: m.homeScore,
  awayScore: m.awayScore,
  date: m.date,
  round: m.round,
  votingStatus: m.votingStatus,
  isCompleted: m.isCompleted,
  videoUrl: m.videoUrl,
});

export const toMatchResponse = (m: ProtoMatch): MatchResponse => ({
  id: m.id,
  date: m.date ?? undefined,
  matchType: m.matchType,
  round: m.round,
  homeTeamScore: m.homeScore,
  awayTeamScore: m.awayScore,
  isCompleted: m.isCompleted,
  teams: [m.homeTeam, m.awayTeam],
  players: m.players,
  videoUrl: m.videoUrl,
});

export const toMatchPageRow = (m: ProtoMatch, model: ProtoModel): MatchPageResponse => ({
  id: m.id,
  date: m.date ?? undefined,
  competitionId: model.id,
  competitionName: model.name,
  competitionType: model.type,
  isAdmin: model.userRole === Role.ADMIN,
  teams: [m.homeTeam, m.awayTeam],
  scores: [m.homeScore, m.awayScore],
  matchType: m.matchType,
  votingEnabled: model.votingEnabled,
  votingStatus: m.votingStatus,
  playerCount: m.players.length,
  pendingVotes: m.pendingVotes,
  playerStats: m.players,
  videoUrl: m.videoUrl,
});

export const groupByRound = (matches: ProtoMatch[]): Record<number, ProtoMatch[]> =>
  matches.reduce<Record<number, ProtoMatch[]>>((acc, m) => {
    (acc[m.round] ??= []).push(m);
    return acc;
  }, {});
