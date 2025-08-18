import { CompetitionResponse, Role } from "@repo/shared-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Settings, Calendar } from "lucide-react";
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

  const handleTabChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("tab", value);
    setSearchParams(newSearchParams);
  };

  // const handleManageTeams = () => {
  //   navigate(`/competition/${competition.id}/teams`);
  // };

  const handleViewMatches = () => {
    navigate(`/matches/${competition.id}`);
  };

  return (
    <div className="relative space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          <Button
            onClick={handleViewMatches}
            className="w-full border-2 border-accent/40 bg-bg/30 text-gray-300 hover:bg-accent/10 sm:w-auto"
            size="sm"
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span className="text-sm sm:text-base">All Matches</span>
          </Button>
          {/* <Button
            onClick={handleManageTeams}
            className="w-full border-2 border-accent/40 bg-bg/30 text-gray-300 hover:bg-accent/10 sm:w-auto"
            size="sm"
          >
            <Users className="mr-2 h-4 w-4" />
            <span className="text-sm sm:text-base">Manage Teams</span>
          </Button> */}
          {competition.userRole === Role.ADMIN && (
            <Button
              onClick={() => navigate(`/competition/${competition.id}/admin`)}
              className="w-full border-2 border-amber-500/40 bg-amber-900/20 text-amber-400 hover:bg-amber-900/30 sm:w-auto"
              size="sm"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Admin</span>
            </Button>
          )}
        </div>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="mb-4 sm:mb-6">
          <TabsList className="grid h-full w-full grid-cols-3 bg-bg/30 p-1">
            <TabsTrigger
              value="standings"
              className="text-xs data-[state=active]:bg-accent/20 data-[state=active]:text-accent sm:text-sm"
            >
              <span className="hidden sm:inline">Standings</span>
              <span className="sm:hidden">Table</span>
            </TabsTrigger>
            <TabsTrigger
              value="fixtures"
              className="text-xs data-[state=active]:bg-accent/20 data-[state=active]:text-accent sm:text-sm"
            >
              Fixtures
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="text-xs data-[state=active]:bg-accent/20 data-[state=active]:text-accent sm:text-sm"
            >
              Stats
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="standings" className="animate-in fade-in-50">
          <Card className="border-2 border-accent/30 bg-panel-bg shadow-md">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg text-accent sm:text-xl">
                League Table
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <LeagueTable competition={competition} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="fixtures" className="animate-in fade-in-50">
          <Card className="border-2 border-accent/30 bg-panel-bg shadow-md">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg text-accent sm:text-xl">
                Match Results
              </CardTitle>
            </CardHeader>
            <CardContent className="max-w-full overflow-hidden p-3 sm:p-6">
              <LeagueMatchList competition={competition} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stats" className="animate-in fade-in-50">
          <Card className="border-2 border-accent/30 bg-panel-bg shadow-md">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-lg text-accent sm:text-xl">
                Player Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="max-w-full overflow-hidden p-3 sm:p-6">
              <LeagueStats competition={competition} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
