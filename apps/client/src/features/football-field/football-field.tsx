import "./football-field.css";
import { MatchResponse } from "@repo/shared-types";
import FieldLayout from "./field-layout.tsx";
import OnFieldPlayers from "./on-field-players.tsx";
import OffFieldPlayers from "./off-field-players.tsx";
import matchTypeFormations from "./formations.ts";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select.tsx";
import { useMemo, useState } from "react";

interface FootballFieldProps {
  match?: MatchResponse;
  hoverable?: boolean;
}

export default function FootballField({
  match,
  hoverable = false,
}: FootballFieldProps) {
  const formations = useMemo(() => {
    return match ? matchTypeFormations[match.matchType] || [] : [];
  }, [match?.matchType]);
  const [selectedFormationHome, setSelectedFormationHome] = useState<{
    [key: number]: [number, number];
  }>({});
  const [selectedFormationAway, setSelectedFormationAway] = useState<{
    [key: number]: [number, number];
  }>({});

  useMemo(() => {
    if (formations.length > 0) {
      setSelectedFormationHome(formations[0].formation);
      setSelectedFormationAway(formations[0].formation);
    }
  }, [formations]);

  const handleFormationChange = (value: string, isHome: boolean) => {
    const formation = formations.find((f) => f.name === value);
    if (formation) {
      if (isHome) {
        setSelectedFormationHome(formation.formation);
      } else {
        setSelectedFormationAway(formation.formation);
      }
    }
  };

  return (
    <div className="flex w-full rotate-90 flex-col items-center py-16 sm:rotate-0 sm:py-8">
      <FieldLayout>
        <>
          <div className="absolute left-0 top-0">
            <Select
              onValueChange={(value) => handleFormationChange(value, true)}
            >
              <SelectTrigger className="h-8 w-8 -rotate-90 rounded-tr-none bg-secondary sm:w-40 sm:rotate-0 sm:rounded-tl-none">
                <SelectValue placeholder="Formation" />
              </SelectTrigger>
              <SelectContent className="absolute top-full z-50 w-40 -translate-x-1/2 bg-secondary font-retro text-gray-300 sm:translate-x-0">
                {formations.map((formation) => {
                  return (
                    <SelectItem
                      key={`select-left-${formation.name}`}
                      value={formation.name}
                      className="font-retro"
                    >
                      {formation.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <OnFieldPlayers
            match={match}
            homeTeam={true}
            playerFormation={selectedFormationHome}
            hoverable={hoverable}
          />
          <div className="absolute right-0 top-0">
            <Select
              onValueChange={(value) => handleFormationChange(value, false)}
            >
              <SelectTrigger className="w-8 -translate-x-1 -translate-y-1 -rotate-90 rounded-br-none bg-secondary sm:w-40 sm:translate-x-0 sm:translate-y-0 sm:rotate-0 sm:rounded-tr-none">
                <SelectValue placeholder="Formation" />
              </SelectTrigger>
              <SelectContent className="absolute top-full z-50 w-40 -translate-x-1/2 bg-secondary text-gray-300 sm:translate-x-0">
                {formations.map((formation) => {
                  return (
                    <SelectItem
                      key={`select-right-${formation.name}`}
                      value={formation.name}
                    >
                      {formation.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <OnFieldPlayers
            match={match}
            homeTeam={false}
            playerFormation={selectedFormationAway}
            hoverable={hoverable}
          />
        </>
      </FieldLayout>
      <div className="relative z-10 flex h-1/4 w-full justify-between bg-secondary">
        <OffFieldPlayers match={match} homeTeam={true} hoverable={hoverable} />
        <OffFieldPlayers match={match} homeTeam={false} hoverable={hoverable} />
      </div>
    </div>
  );
}
