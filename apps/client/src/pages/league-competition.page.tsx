import { CompetitionResponse, Role } from "@repo/logger";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Settings, Users, Calendar } from "lucide-react";
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
import LeagueTable from "../components/features/league/league-table";
import LeagueMatchList from "../components/features/league/league-match-list";
import LeagueStats from "../components/features/league/league-stats";

interface LeagueCompetitionPageProps {
  competition: CompetitionResponse;
}

export default function LeagueCompetitionPage({
  competition,
}: LeagueCompetitionPageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "standings";

  const hasCustomTeamNames =
    competition.teams?.some(
      (team) =>
        !team.name.match(/^team-\d+$/i) && !team.name.match(/^Team \d+$/i),
    ) ?? false;

  if (!hasCustomTeamNames) {
    navigate(`/league-setup/${competition.id}`);
  }

  const handleTabChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("tab", value);
    setSearchParams(newSearchParams);
  };

  const handleManageTeams = () => {
    navigate(`/competition/${competition.id}/teams`);
  };

  const handleViewMatches = () => {
    navigate(`/matches/${competition.id}`);
  };

  return (
    <div className="relative space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleViewMatches}
            className="border-2 border-accent/40 bg-bg/30 text-gray-300 hover:bg-accent/10"
          >
            <Calendar className="mr-1 h-4 w-4" />
            All Matches
          </Button>
          <Button
            onClick={handleManageTeams}
            className="border-2 border-accent/40 bg-bg/30 text-gray-300 hover:bg-accent/10"
          >
            <Users className="mr-1 h-4 w-4" />
            Manage Teams
          </Button>
          {competition.userRole === Role.ADMIN && (
            <Button
              onClick={() => navigate(`/competition/${competition.id}/admin`)}
              className="border-2 border-amber-500/40 bg-amber-900/20 text-amber-400 hover:bg-amber-900/30"
            >
              <Settings className="mr-1 h-4 w-4" />
              Admin
            </Button>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
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
            value="stats"
            className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent"
          >
            Stats
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
              <LeagueTable competition={competition} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixtures" className="animate-in fade-in-50">
          <Card className="border-2 border-accent/30 bg-panel-bg shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-accent">
                Match Results
              </CardTitle>
            </CardHeader>
            <CardContent className="max-w-full overflow-hidden">
              <LeagueMatchList competition={competition} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stats" className="animate-in fade-in-50">
          <Card className="border-2 border-accent/30 bg-panel-bg shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-accent">
                Player Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="max-w-full overflow-hidden">
              <LeagueStats competition={competition} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
