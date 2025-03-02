import MatchResult from "./match-result";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "../../ui/carousel";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../../ui/button";
import { MatchResponse } from "@repo/logger";

interface MatchListProps {
  matches: MatchResponse[];
  selectedMatch: number;
  onMatchClick: (arg0: number) => void;
  isLoggedIn: boolean;
  refetchMatches: () => void;
}

export default function MatchList({
  matches,
  selectedMatch,
  onMatchClick,
  isLoggedIn,
  refetchMatches,
}: MatchListProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(1);

  const sortedMatchIndexes = matches
    .map((match, index) => ({ match, index }))
    .sort(
      (a, b) =>
        new Date(a.match.date).getTime() - new Date(b.match.date).getTime(),
    )
    .map(({ index }) => index);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    onMatchClick(sortedMatchIndexes[current - 1]);
  }, [current, onMatchClick, sortedMatchIndexes]);

  return (
    <>
      <div className="m-4 flex touch-none justify-between">
        <h2 className="text-xl font-semibold">Match Results</h2>
        {isLoggedIn && (
          <Link to="/add-match">
            <Button className="border-green-300 bg-gradient-to-br from-green-400 to-green-600 transition-all duration-300 ease-linear hover:from-green-400 hover:to-green-800">
              Add Match
            </Button>
          </Link>
        )}
      </div>
      <Carousel
        className="flex max-w-xs flex-row items-center self-center py-4 md:max-w-xl"
        setApi={setApi}
      >
        <Button
          className="rounded-full bg-transparent p-2 text-black shadow-none hover:bg-green-50 disabled:bg-transparent"
          onClick={() => {
            api?.scrollPrev();
          }}
          disabled={!api?.canScrollPrev()}
        >
          <ArrowLeft />
        </Button>
        <CarouselContent>
          {matches &&
            matches
              .slice()
              .sort((a, b) => b.round - a.round)
              .map((match) => {
                if (!match) return null;
                return (
                  <CarouselItem key={match.id}>
                    <MatchResult
                      key={match.id}
                      matchId={match.id}
                      date={match.date.split("T")[0]}
                      homeScore={match.home_team_score}
                      awayScore={match.away_team_score}
                      round={match.round}
                      isSelectedMatch={
                        matches[selectedMatch] &&
                        matches[selectedMatch].id === match.id
                          ? true
                          : false
                      }
                      refetchMatches={refetchMatches}
                    />
                  </CarouselItem>
                );
              })}
        </CarouselContent>
        {matches && matches.length === 0 && (
          <div className="">Add your first match</div>
        )}
        <Button
          className="rounded-full bg-transparent p-2 text-black shadow-none hover:bg-green-50 disabled:bg-transparent"
          onClick={() => {
            api?.scrollNext();
          }}
          disabled={!api?.canScrollNext()}
        >
          <ArrowRight />
        </Button>
      </Carousel>
    </>
  );
}
