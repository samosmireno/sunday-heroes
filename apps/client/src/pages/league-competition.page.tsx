import { CompetitionResponse, CompetitionType } from "@repo/logger";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

// Types for our mock data
interface LeagueTeam {
  id: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

interface LeagueMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  status: "PLAYED" | "SCHEDULED" | "LIVE";
}

// Mock data for the league table
const mockLeagueTable: LeagueTeam[] = [
  {
    id: "1",
    name: "FC Barcelona",
    played: 10,
    won: 8,
    drawn: 1,
    lost: 1,
    goalsFor: 24,
    goalsAgainst: 8,
    points: 25,
  },
  {
    id: "2",
    name: "Real Madrid",
    played: 10,
    won: 7,
    drawn: 2,
    lost: 1,
    goalsFor: 22,
    goalsAgainst: 10,
    points: 23,
  },
  {
    id: "3",
    name: "Atletico Madrid",
    played: 10,
    won: 6,
    drawn: 3,
    lost: 1,
    goalsFor: 18,
    goalsAgainst: 7,
    points: 21,
  },
  {
    id: "4",
    name: "Athletic Bilbao",
    played: 10,
    won: 5,
    drawn: 2,
    lost: 3,
    goalsFor: 16,
    goalsAgainst: 12,
    points: 17,
  },
  {
    id: "5",
    name: "Villarreal",
    played: 10,
    won: 5,
    drawn: 1,
    lost: 4,
    goalsFor: 15,
    goalsAgainst: 14,
    points: 16,
  },
  {
    id: "6",
    name: "Real Sociedad",
    played: 10,
    won: 4,
    drawn: 3,
    lost: 3,
    goalsFor: 14,
    goalsAgainst: 12,
    points: 15,
  },
  {
    id: "7",
    name: "Real Betis",
    played: 10,
    won: 4,
    drawn: 2,
    lost: 4,
    goalsFor: 13,
    goalsAgainst: 15,
    points: 14,
  },
  {
    id: "8",
    name: "Valencia",
    played: 10,
    won: 3,
    drawn: 3,
    lost: 4,
    goalsFor: 12,
    goalsAgainst: 14,
    points: 12,
  },
];

// Mock data for matches
const mockMatches: LeagueMatch[] = [
  {
    id: "m1",
    homeTeam: "FC Barcelona",
    awayTeam: "Real Madrid",
    homeScore: 3,
    awayScore: 2,
    date: "2025-04-10T18:00:00Z",
    status: "PLAYED",
  },
  {
    id: "m2",
    homeTeam: "Atletico Madrid",
    awayTeam: "Athletic Bilbao",
    homeScore: 2,
    awayScore: 0,
    date: "2025-04-11T18:00:00Z",
    status: "PLAYED",
  },
  {
    id: "m3",
    homeTeam: "Villarreal",
    awayTeam: "Real Sociedad",
    homeScore: 1,
    awayScore: 1,
    date: "2025-04-12T18:00:00Z",
    status: "PLAYED",
  },
  {
    id: "m4",
    homeTeam: "Real Betis",
    awayTeam: "Valencia",
    homeScore: 2,
    awayScore: 1,
    date: "2025-04-13T18:00:00Z",
    status: "PLAYED",
  },
  {
    id: "m5",
    homeTeam: "Real Madrid",
    awayTeam: "Atletico Madrid",
    homeScore: null,
    awayScore: null,
    date: "2025-05-18T18:00:00Z",
    status: "SCHEDULED",
  },
  {
    id: "m6",
    homeTeam: "Athletic Bilbao",
    awayTeam: "Villarreal",
    homeScore: null,
    awayScore: null,
    date: "2025-05-19T18:00:00Z",
    status: "SCHEDULED",
  },
];

// League Table Component
const LeagueTable = ({ teams }: { teams: LeagueTeam[] }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-accent/30 text-accent">
            <th className="py-2 text-left font-bold">Pos</th>
            <th className="py-2 text-left font-bold">Team</th>
            <th className="py-2 text-center font-bold">P</th>
            <th className="py-2 text-center font-bold">W</th>
            <th className="py-2 text-center font-bold">D</th>
            <th className="py-2 text-center font-bold">L</th>
            <th className="py-2 text-center font-bold">GF</th>
            <th className="py-2 text-center font-bold">GA</th>
            <th className="py-2 text-center font-bold">GD</th>
            <th className="py-2 text-center font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr
              key={team.id}
              className={`border-b border-accent/10 text-white ${
                index < 4 ? "bg-green-900/10" : ""
              }`}
            >
              <td className="py-2 text-left">{index + 1}</td>
              <td className="py-2 text-left font-medium">{team.name}</td>
              <td className="py-2 text-center">{team.played}</td>
              <td className="py-2 text-center">{team.won}</td>
              <td className="py-2 text-center">{team.drawn}</td>
              <td className="py-2 text-center">{team.lost}</td>
              <td className="py-2 text-center">{team.goalsFor}</td>
              <td className="py-2 text-center">{team.goalsAgainst}</td>
              <td className="py-2 text-center">
                {team.goalsFor - team.goalsAgainst}
              </td>
              <td className="py-2 text-center font-bold text-accent">
                {team.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Match List Component
const MatchList = ({ matches }: { matches: LeagueMatch[] }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => (
        <div
          key={match.id}
          className="rounded-lg border-2 border-accent/30 bg-panel-bg p-4 shadow-md"
        >
          <div className="mb-2 flex justify-between text-sm text-gray-400">
            <span>
              {new Date(match.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span
              className={`rounded px-2 text-xs font-bold ${
                match.status === "PLAYED"
                  ? "bg-green-900/20 text-green-400"
                  : match.status === "LIVE"
                    ? "bg-red-900/20 text-red-400"
                    : "bg-gray-900/20 text-gray-400"
              }`}
            >
              {match.status}
            </span>
          </div>

          <div className="grid grid-cols-3 items-center gap-2">
            <div className="text-right font-medium">{match.homeTeam}</div>
            <div className="text-center font-bold">
              {match.homeScore !== null && match.awayScore !== null
                ? `${match.homeScore} - ${match.awayScore}`
                : "vs"}
            </div>
            <div className="text-left font-medium">{match.awayTeam}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface LeagueCompetitionPageProps {
  competition: CompetitionResponse;
  refetch: () => void;
}

export default function LeagueCompetitionPage({
  competition,
  refetch,
}: LeagueCompetitionPageProps) {
  const navigate = useNavigate();

  // Verify we have the correct competition type
  if (competition.type !== CompetitionType.LEAGUE) {
    console.error("Wrong competition type provided to LeagueCompetitionPage");
    return <div>Error: Not a league competition</div>;
  }

  const handleAddMatch = () => {
    navigate(`/add-match/${competition.id}`);
  };

  return (
    <div className="relative space-y-6">
      <div className="flex items-end justify-end">
        <Button
          onClick={handleAddMatch}
          className="bg-accent/20 text-accent hover:bg-accent/30"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Match
        </Button>
      </div>

      <Tabs defaultValue="standings" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-3 bg-bg/30">
          <TabsTrigger
            value="standings"
            className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent"
          >
            Standings
          </TabsTrigger>
          <TabsTrigger
            value="fixtures"
            className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent"
          >
            Fixtures
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent"
          >
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standings" className="animate-in fade-in-50">
          <Card className="border-2 border-accent/30 bg-panel-bg shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-accent">
                League Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeagueTable teams={mockLeagueTable} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixtures" className="animate-in fade-in-50">
          <Card className="border-2 border-accent/30 bg-panel-bg shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-accent">
                Upcoming Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MatchList
                matches={mockMatches.filter(
                  (match) => match.status === "SCHEDULED",
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="animate-in fade-in-50">
          <Card className="border-2 border-accent/30 bg-panel-bg shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-accent">
                Match Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MatchList
                matches={mockMatches.filter(
                  (match) => match.status === "PLAYED",
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats and highlights section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-2 border-accent/30 bg-panel-bg shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-accent">Top Scorers</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b border-accent/30 text-accent">
                  <th className="py-2 text-left font-bold">Player</th>
                  <th className="py-2 text-left font-bold">Team</th>
                  <th className="py-2 text-center font-bold">Goals</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-accent/10">
                  <td className="py-2 text-left font-medium">
                    Robert Lewandowski
                  </td>
                  <td className="py-2 text-left">FC Barcelona</td>
                  <td className="py-2 text-center">8</td>
                </tr>
                <tr className="border-b border-accent/10">
                  <td className="py-2 text-left font-medium">Karim Benzema</td>
                  <td className="py-2 text-left">Real Madrid</td>
                  <td className="py-2 text-center">7</td>
                </tr>
                <tr className="border-b border-accent/10">
                  <td className="py-2 text-left font-medium">
                    Antoine Griezmann
                  </td>
                  <td className="py-2 text-left">Atletico Madrid</td>
                  <td className="py-2 text-center">6</td>
                </tr>
                <tr className="border-b border-accent/10">
                  <td className="py-2 text-left font-medium">Inaki Williams</td>
                  <td className="py-2 text-left">Athletic Bilbao</td>
                  <td className="py-2 text-center">5</td>
                </tr>
                <tr className="border-b border-accent/10">
                  <td className="py-2 text-left font-medium">Gerard Moreno</td>
                  <td className="py-2 text-left">Villarreal</td>
                  <td className="py-2 text-center">4</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-2 border-accent/30 bg-panel-bg shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-accent">Recent Form</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b border-accent/30 text-accent">
                  <th className="py-2 text-left font-bold">Team</th>
                  <th className="py-2 text-left font-bold">Last 5 matches</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-accent/10">
                  <td className="py-2 text-left font-medium">FC Barcelona</td>
                  <td className="py-2 text-left">
                    <div className="flex space-x-1">
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-gray-500/80 text-center font-bold text-white">
                        D
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-accent/10">
                  <td className="py-2 text-left font-medium">Real Madrid</td>
                  <td className="py-2 text-left">
                    <div className="flex space-x-1">
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-red-500/80 text-center font-bold text-white">
                        L
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-gray-500/80 text-center font-bold text-white">
                        D
                      </span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-accent/10">
                  <td className="py-2 text-left font-medium">
                    Atletico Madrid
                  </td>
                  <td className="py-2 text-left">
                    <div className="flex space-x-1">
                      <span className="inline-block h-6 w-6 rounded-full bg-gray-500/80 text-center font-bold text-white">
                        D
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-gray-500/80 text-center font-bold text-white">
                        D
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-accent/10">
                  <td className="py-2 text-left font-medium">
                    Athletic Bilbao
                  </td>
                  <td className="py-2 text-left">
                    <div className="flex space-x-1">
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-gray-500/80 text-center font-bold text-white">
                        D
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-red-500/80 text-center font-bold text-white">
                        L
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-accent/10">
                  <td className="py-2 text-left font-medium">Villarreal</td>
                  <td className="py-2 text-left">
                    <div className="flex space-x-1">
                      <span className="inline-block h-6 w-6 rounded-full bg-red-500/80 text-center font-bold text-white">
                        L
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-red-500/80 text-center font-bold text-white">
                        L
                      </span>
                      <span className="inline-block h-6 w-6 rounded-full bg-green-500/80 text-center font-bold text-white">
                        W
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
