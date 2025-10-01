import MatchResult from "./match-result";
import { Link, useParams } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchResponse, Role } from "@repo/shared-types";

interface MatchListProps {
  userRole: Role;
  matches: MatchResponse[];
  selectedMatch: number;
  onMatchClick: (arg0: number) => void;
  refetchMatches: () => void;
}

export default function MatchList({
  userRole,
  matches,
  selectedMatch,
  onMatchClick,
  refetchMatches,
}: MatchListProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(1);
  const { competitionId } = useParams<{
    competitionId: string;
  }>();

  const sortedMatchIndexes = matches
    .map((match, index) => ({ match, index }))
    .sort((a, b) => {
      if (!a.match.date && !b.match.date) return 0;
      if (!a.match.date) return 1;
      if (!b.match.date) return -1;
      return (
        new Date(b.match.date).getTime() - new Date(a.match.date).getTime()
      );
    })
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
      <div className="mb-6 flex items-center justify-between gap-2 border-b-2 border-dashed border-accent pb-3">
        <h2
          className="text-md uppercase text-accent sm:text-xl"
          style={{ textShadow: "1px 1px 0 #000" }}
        >
          Match Results
        </h2>
        {userRole !== Role.PLAYER && (
          <Link to={`/add-match/${competitionId}`}>
            <Button className="transform rounded bg-accent px-4 py-2 font-bold uppercase text-bg shadow-md transition-transform duration-200 hover:translate-y-1 hover:bg-accent">
              Add Match
            </Button>
          </Link>
        )}
      </div>
      <Carousel
        className="flex w-full max-w-xs flex-row items-center justify-center self-center py-2 sm:max-w-sm sm:py-4 md:max-w-xl"
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
        {matches && matches.length > 0 ? (
          <CarouselContent className="px-2">
            {matches
              .slice()
              .sort((a, b) => {
                if (!a.date && !b.date) return 0;
                if (!a.date) return 1;
                if (!b.date) return -1;
                return new Date(b.date).getTime() - new Date(a.date).getTime();
              })
              .map((match) => {
                if (!match) return null;
                return (
                  <CarouselItem key={match.id}>
                    <MatchResult
                      key={match.id}
                      matchId={match.id}
                      date={match.date?.split("T")[0]}
                      homeScore={match.homeTeamScore}
                      awayScore={match.awayTeamScore}
                      isSelectedMatch={
                        matches[selectedMatch] &&
                        matches[selectedMatch].id === match.id
                          ? true
                          : false
                      }
                      refetchMatches={refetchMatches}
                      userRole={userRole}
                      videoUrl={match.videoUrl}
                    />
                  </CarouselItem>
                );
              })}
          </CarouselContent>
        ) : (
          <div className="w-full rounded-lg bg-primary/20 py-4 text-center text-sm sm:text-base">
            Add your first match
          </div>
        )}

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
