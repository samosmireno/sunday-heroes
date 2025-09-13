import "./football-field.css";
import { MatchResponse } from "@repo/shared-types";
import findStarPlayer from "./utils";
import FieldLayout from "./field-layout";
import OnFieldPlayers from "./on-field-players.tsx";
import OffFieldPlayers from "./off-field-players.tsx";
import matchTypeFormations, { Formation } from "./formations.ts";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "../../ui/select.tsx";

import { useEffect, useState } from "react";

interface FootballFieldProps {
  match?: MatchResponse;
  hoverable?: boolean;
}

export default function FootballField({
  match,
  hoverable = false,
}: FootballFieldProps) {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [selectedFormationHome, setSelectedFormationHome] = useState<{
    [key: number]: [number, number];
  }>({});
  const [selectedFormationAway, setSelectedFormationAway] = useState<{
    [key: number]: [number, number];
  }>({});

  useEffect(() => {
    if (match) {
      const matchFormations = matchTypeFormations[match.matchType];
      setFormations(matchFormations);
      if (matchFormations.length > 0) {
        setSelectedFormationHome(matchFormations[0].formation);
        setSelectedFormationAway(matchFormations[0].formation);
      }
    }
  }, [match]);

  const starPlayerId = findStarPlayer(match);

  return (
    <div className="flex w-full rotate-90 flex-col items-center py-16 sm:rotate-0 sm:py-8">
      <FieldLayout>
        <>
          <div className="absolute left-0 top-0">
            <Select
              onValueChange={(value) => {
                const formation = formations.find((f) => f.name === value);
                if (formation) {
                  setSelectedFormationHome(formation.formation);
                }
              }}
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
            starPlayerId={starPlayerId}
            hoverable={hoverable}
          />
          <div className="absolute right-0 top-0">
            <Select
              onValueChange={(value) => {
                const formation = formations.find((f) => f.name === value);
                if (formation) {
                  setSelectedFormationAway(formation.formation);
                }
              }}
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
            starPlayerId={starPlayerId}
            hoverable={hoverable}
          />
        </>
      </FieldLayout>
      <div className="relative z-10 flex h-1/4 w-full justify-between bg-secondary">
        <OffFieldPlayers
          match={match}
          homeTeam={true}
          starPlayerId={starPlayerId}
          hoverable={hoverable}
        />
        <OffFieldPlayers
          match={match}
          homeTeam={false}
          starPlayerId={starPlayerId}
          hoverable={hoverable}
        />
      </div>
    </div>
  );
}
