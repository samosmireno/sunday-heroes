import "../index.css";
import MatchList from "../components/features/match-list/match-list";
import StatsTable from "../components/features/stats-table/stats-table";
import FootballField from "../components/features/football-field/football-field";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { config } from "../config/config";
import { setAuthUpdateCallback } from "../config/axiosConfig";
import { MatchResponse } from "@repo/logger";

const fetchMatches = async (): Promise<MatchResponse[]> => {
  const { data } = await axios.get(`${config.server}/api/matches`);
  return data;
};

function HomePage() {
  const [currentMatch, setCurrentMatch] = useState<number>(0);
  const { isLoggedIn, login, logout, setIsLoggedIn } = useAuth();

  const {
    data: matches = [],
    isLoading,
    refetch,
  } = useQuery<MatchResponse[], Error>({
    queryKey: ["matches"],
    queryFn: fetchMatches,
  });

  function handleMatchClick(getCurrentMatch: number) {
    setCurrentMatch(getCurrentMatch);
  }

  useEffect(() => {
    setAuthUpdateCallback(setIsLoggedIn);
  }, [setIsLoggedIn]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-300 to-white">
      <div className="flex flex-row items-center justify-between px-3 py-5">
        <h1 className="flex-grow text-center font-oswald text-3xl font-semibold">
          SUNDAY HEROES
        </h1>
        <button
          className="cursor-pointer border-none bg-transparent px-2 py-5 font-exo text-base decoration-0 hover:underline"
          onClick={isLoggedIn ? logout : login}
        >
          {isLoggedIn ? "Logout" : "Login"}
        </button>
      </div>
      <div className="flex flex-col justify-around xl:flex-row">
        <div className="flex w-full max-w-2xl flex-col p-4 md:mx-auto">
          <MatchList
            matches={matches}
            selectedMatch={currentMatch}
            onMatchClick={handleMatchClick}
            isLoggedIn={isLoggedIn}
            refetchMatches={refetch}
          />
          <FootballField match={matches[currentMatch]} />
        </div>
        <div className="m-4 mx-auto flex max-w-xl flex-col p-4">
          <StatsTable matches={matches} />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
