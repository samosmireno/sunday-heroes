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
  competitionId: string;
  matches: MatchResponse[];
  selectedMatch: number;
  onMatchClick: (arg0: number) => void;
  refetchMatches: () => void;
}

export default function MatchList({
  competitionId,
  matches,
  selectedMatch,
  onMatchClick,
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
    <div className="flex w-full flex-col">
      <div className="mb-6 flex items-center justify-between border-b-2 border-dashed border-accent pb-3">
        <h2
          className="text-xl uppercase text-accent"
          style={{ textShadow: "1px 1px 0 #000" }}
        >
          Match Results
        </h2>
        <Link to={`/add-match/${competitionId}`}>
          <Button className="transform rounded bg-accent px-4 py-2 font-bold uppercase text-bg shadow-md transition-transform duration-200 hover:translate-y-1 hover:bg-accent">
            Add Match
          </Button>
        </Link>
      </div>
      <Carousel
        className="flex w-full max-w-xs flex-row items-center self-center py-2 sm:max-w-sm sm:py-4 md:max-w-xl"
        setApi={setApi}
      >
        <Button
          className="hidden rounded-full bg-transparent p-1 text-accent shadow-none hover:bg-primary disabled:bg-transparent sm:flex sm:p-2"
          onClick={() => {
            api?.scrollPrev();
          }}
          disabled={!api?.canScrollPrev()}
        >
          <ArrowLeft size={18} className="sm:size-20" />
        </Button>
        <CarouselContent className="px-2">
          {matches && matches.length > 0 ? (
            matches
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime(),
              )
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
              })
          ) : (
            <div className="w-full rounded-lg bg-primary/20 py-8 text-center text-sm sm:text-base">
              Add your first match
            </div>
          )}
        </CarouselContent>
        <Button
          className="hidden rounded-full bg-transparent p-1 text-accent shadow-none hover:bg-primary disabled:bg-transparent sm:flex sm:p-2"
          onClick={() => {
            api?.scrollNext();
          }}
          disabled={!api?.canScrollNext()}
        >
          <ArrowRight size={18} className="sm:size-20" />
        </Button>
      </Carousel>
    </div>
  );
}
