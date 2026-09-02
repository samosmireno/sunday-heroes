// PROTOTYPE — throwaway. Duel "Match Results" panel: carousel of the
// matches in scope, read-only for a closed season, field below.
import { ReactNode, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Pencil, Trash, Video } from "lucide-react";
import { Role } from "@repo/shared-types";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import FootballField from "@/features/football-field/football-field";
import {
  ProtoMatch,
  ProtoModel,
  SeasonSelection,
  currentSeason,
  matchesFor,
  seasonByNumber,
  toMatchResponse,
} from "./fake-seasons";
import { ClosedSeasonBadge } from "./season-marks";

interface DuelMatchesViewProps {
  model: ProtoModel;
  selection: SeasonSelection;
  headerRight?: ReactNode;
  showAddMatch?: boolean;
  addMatchHint?: string;
}

const formatLongDate = (date: string | null) =>
  date
    ? new Date(date)
        .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
        .replace(/(\d+)(?=\s)/, (d) => `${d}th`)
    : "Date TBD";

function ResultCard({ match, model, showSeason }: { match: ProtoMatch; model: ProtoModel; showSeason: boolean }) {
  const season = seasonByNumber(model, match.seasonNumber)!;
  const closed = season.endedAt !== null;
  return (
    <div className="w-full">
      <div className="relative mb-3 rounded-lg border-2 border-accent bg-secondary p-3 text-center shadow-inner sm:mb-4 sm:p-4 md:mb-6 md:p-6">
        {showSeason && (
          <span className="absolute left-2 top-2 rounded bg-bg/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent/80">
            Season {match.seasonNumber}
          </span>
        )}
        <div className="flex w-full flex-col">
          <div className="mb-3 flex items-center justify-center gap-4 text-2xl font-bold sm:mb-4 sm:text-3xl md:mb-6 md:text-4xl">
            {[
              ["Home", match.homeScore],
              ["Away", match.awayScore],
            ].map(([label, score]) => (
              <div key={String(label)} className="flex flex-col gap-2 text-center sm:gap-3 md:gap-4">
                <div className="mx-2 text-xs sm:mx-4 sm:text-sm md:text-base">{label}</div>
                <div className="min-w-fit rounded border-2 border-accent bg-bg px-3 py-2 shadow-inner sm:px-4 sm:py-3 md:px-6">{score}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between px-2 pt-1 text-center sm:px-4 sm:pt-2">
            <div className="text-xs text-accent sm:text-sm">{formatLongDate(match.date)}</div>
            <div className="mt-2 flex items-center justify-center gap-4 sm:mt-3 sm:gap-6 md:mt-4">
              {match.videoUrl && <Video className="h-4 w-4 text-accent md:h-5 md:w-5" />}
              {model.userRole !== Role.PLAYER &&
                (closed ? (
                  <ClosedSeasonBadge season={season} size="xs" />
                ) : (
                  <>
                    <Pencil className="h-4 w-4 text-accent md:h-5 md:w-5" />
                    <Trash className="h-4 w-4 text-accent hover:cursor-pointer md:h-5 md:w-5" />
                  </>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DuelMatchesView({ model, selection, headerRight, showAddMatch = true, addMatchHint }: DuelMatchesViewProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(0);
  const matches = useMemo(
    () =>
      [...matchesFor(model, selection)].sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }),
    [model, selection],
  );

  useEffect(() => {
    if (!api) return;
    const update = () => setIndex(api.selectedScrollSnap());
    update();
    api.on("select", update);
    return () => {
      api.off("select", update);
    };
  }, [api]);

  useEffect(() => {
    api?.scrollTo(0, true);
    setIndex(0);
  }, [api, selection]);

  const selected = matches[index] ?? matches[0];
  const current = currentSeason(model);

  return (
    <>
      <div className="flex-shrink-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-accent pb-3">
          <h2 className="text-md uppercase text-accent sm:text-xl" style={{ textShadow: "1px 1px 0 #000" }}>
            Match Results
          </h2>
          <div className="flex items-center gap-2">
            {headerRight}
            {model.userRole !== Role.PLAYER &&
              (showAddMatch ? (
                <Button title={`Adds to Season ${current.number}`} className="transform rounded bg-accent px-4 py-2 font-bold uppercase text-bg shadow-md transition-transform duration-200 hover:translate-y-1 hover:bg-accent">
                  Add Match
                </Button>
              ) : (
                addMatchHint && <span className="text-xs text-gray-400">{addMatchHint}</span>
              ))}
          </div>
        </div>
        <Carousel key={String(selection)} className="flex w-full max-w-xs flex-row items-center justify-center self-center py-2 sm:max-w-sm sm:py-4 md:max-w-xl" setApi={setApi}>
          <Button className="hidden rounded-full bg-transparent p-1 text-accent shadow-none hover:bg-primary disabled:bg-transparent sm:flex sm:p-2" onClick={() => api?.scrollPrev()} disabled={!api?.canScrollPrev()}>
            <ArrowLeft size={18} className="sm:size-20" />
          </Button>
          {matches.length > 0 ? (
            <CarouselContent className="px-2">
              {matches.map((m) => (
                <CarouselItem key={m.id}>
                  <ResultCard match={m} model={model} showSeason={selection === "all"} />
                </CarouselItem>
              ))}
            </CarouselContent>
          ) : (
            <div className="w-full rounded-lg bg-primary/20 py-4 text-center text-sm sm:text-base">
              {selection === current.number ? "Add your first match" : "No matches in this season"}
            </div>
          )}
          <Button className="hidden rounded-full bg-transparent p-1 text-accent shadow-none hover:bg-primary disabled:bg-transparent sm:flex sm:p-2" onClick={() => api?.scrollNext()} disabled={!api?.canScrollNext()}>
            <ArrowRight size={18} className="sm:size-20" />
          </Button>
        </Carousel>
        {matches.length > 0 && (
          <div className="text-xs text-gray-500">
            {index + 1} / {matches.length}
          </div>
        )}
      </div>
      <div className="flex items-center justify-center">
        {selected && <FootballField match={toMatchResponse(selected)} hoverable={true} />}
      </div>
    </>
  );
}
