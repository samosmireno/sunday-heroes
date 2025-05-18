export interface PlayerStats {
  id: string;
  name: string;
  goals: number;
  assists: number;
  rating: number;
  teamIndex: 0 | 1; // 0 for home team, 1 for away team
}

export interface MockMatch {
  id: string;
  date: Date;
  teams: string[];
  scores: number[];
  penaltyScores?: number[];
  matchType: string;
  votingStatus: "OPEN" | "CLOSED" | "NOT_STARTED";
  votingEndsAt?: Date;
  playerCount: number;
  pendingVotes: number;
  playerStats: PlayerStats[];
}

// Generate dates from past to future
const generateDate = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
};

// Helper function to generate player stats
const generatePlayers = (
  team1Name: string,
  team2Name: string,
  team1Score: number,
  team2Score: number,
): PlayerStats[] => {
  const players: PlayerStats[] = [];

  // Generate home team players (team index 0)
  for (let i = 1; i <= 11; i++) {
    const isScorer = i <= team1Score;
    const goals = isScorer ? 1 : 0;
    const assists = i > team1Score && i <= team1Score * 2 ? 1 : 0;

    players.push({
      id: `player-${team1Name.toLowerCase().replace(/\s/g, "-")}-${i}`,
      name: `${team1Name.split(" ")[0]} Player ${i}`,
      goals,
      assists,
      rating: 5 + Math.random() * 5, // Rating between 5-10
      teamIndex: 0,
    });
  }

  // Generate away team players (team index 1)
  for (let i = 1; i <= 11; i++) {
    const isScorer = i <= team2Score;
    const goals = isScorer ? 1 : 0;
    const assists = i > team2Score && i <= team2Score * 2 ? 1 : 0;

    players.push({
      id: `player-${team2Name.toLowerCase().replace(/\s/g, "-")}-${i}`,
      name: `${team2Name.split(" ")[0]} Player ${i}`,
      goals,
      assists,
      rating: 5 + Math.random() * 5, // Rating between 5-10
      teamIndex: 1,
    });
  }

  return players;
};

export const mockMatches: MockMatch[] = [
  {
    id: "1",
    date: generateDate(-15),
    teams: ["FC Sunrise", "City United"],
    scores: [3, 2],
    matchType: "DUEL",
    votingStatus: "CLOSED",
    playerCount: 22,
    pendingVotes: 0,
    playerStats: generatePlayers("FC Sunrise", "City United", 3, 2),
  },
  {
    id: "2",
    date: generateDate(-10),
    teams: ["Sunday Stars", "Weekend Warriors"],
    scores: [2, 2],
    penaltyScores: [5, 4],
    matchType: "KNOCKOUT",
    votingStatus: "CLOSED",
    playerCount: 22,
    pendingVotes: 0,
    playerStats: generatePlayers("Sunday Stars", "Weekend Warriors", 2, 2),
  },
  {
    id: "3",
    date: generateDate(-7),
    teams: ["FC United", "Real Friends"],
    scores: [1, 3],
    matchType: "LEAGUE",
    votingStatus: "CLOSED",
    playerCount: 22,
    pendingVotes: 0,
    playerStats: generatePlayers("FC United", "Real Friends", 1, 3),
  },
  {
    id: "4",
    date: generateDate(-3),
    teams: ["Shooting Stars", "FC Phoenix"],
    scores: [2, 0],
    matchType: "LEAGUE",
    votingStatus: "OPEN",
    votingEndsAt: generateDate(2),
    playerCount: 22,
    pendingVotes: 5,
    playerStats: generatePlayers("Shooting Stars", "FC Phoenix", 2, 0),
  },
  {
    id: "5",
    date: generateDate(-1),
    teams: ["Sunday Heroes", "Weekend Warriors"],
    scores: [4, 1],
    matchType: "DUEL",
    votingStatus: "OPEN",
    votingEndsAt: generateDate(4),
    playerCount: 22,
    pendingVotes: 8,
    playerStats: generatePlayers("Sunday Heroes", "Weekend Warriors", 4, 1),
  },
  {
    id: "6",
    date: generateDate(3),
    teams: ["FC Sunrise", "Sunday Stars"],
    scores: [0, 0],
    matchType: "LEAGUE",
    votingStatus: "NOT_STARTED",
    playerCount: 22,
    pendingVotes: 22,
    playerStats: generatePlayers("FC Sunrise", "Sunday Stars", 0, 0),
  },
  {
    id: "7",
    date: generateDate(7),
    teams: ["City United", "FC United"],
    scores: [0, 0],
    matchType: "KNOCKOUT",
    votingStatus: "NOT_STARTED",
    playerCount: 22,
    pendingVotes: 22,
    playerStats: generatePlayers("City United", "FC United", 0, 0),
  },
  {
    id: "8",
    date: generateDate(10),
    teams: ["Real Friends", "Shooting Stars"],
    scores: [0, 0],
    matchType: "LEAGUE",
    votingStatus: "NOT_STARTED",
    playerCount: 22,
    pendingVotes: 22,
    playerStats: generatePlayers("Real Friends", "Shooting Stars", 0, 0),
  },
  {
    id: "9",
    date: generateDate(15),
    teams: ["FC Phoenix", "Sunday Heroes"],
    scores: [0, 0],
    matchType: "DUEL",
    votingStatus: "NOT_STARTED",
    playerCount: 22,
    pendingVotes: 22,
    playerStats: generatePlayers("FC Phoenix", "Sunday Heroes", 0, 0),
  },
  {
    id: "10",
    date: generateDate(20),
    teams: ["Weekend Warriors", "FC Sunrise"],
    scores: [0, 0],
    matchType: "KNOCKOUT",
    votingStatus: "NOT_STARTED",
    playerCount: 22,
    pendingVotes: 22,
    playerStats: generatePlayers("Weekend Warriors", "FC Sunrise", 0, 0),
  },
];
