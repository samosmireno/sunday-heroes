import "./football-field.css";
import { MatchResponse } from "@repo/logger";
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
  match: MatchResponse | null;
  isEdited?: boolean;
}

export default function FootballField({
  match,
  isEdited = false,
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
      const matchFormations = matchTypeFormations[match.match_type];
      setFormations(matchFormations);
      if (matchFormations.length > 0) {
        setSelectedFormationHome(matchFormations[0].formation);
        setSelectedFormationAway(matchFormations[0].formation);
      }
    }
  }, [match]);

  const starPlayerId = match ? findStarPlayer(match) : null;

  return (
    <div className="flex w-full rotate-90 flex-col items-center py-16 md:rotate-0 md:py-8">
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
              <SelectTrigger className="h-8 w-8 -rotate-90 rounded-tr-none bg-green-50 md:w-40 md:rotate-0 md:rounded-tl-none">
                <SelectValue placeholder="Formation" />
              </SelectTrigger>
              <SelectContent className="absolute top-full z-50 w-40 -translate-x-1/2 md:translate-x-0">
                {formations.map((formation, index) => {
                  return (
                    <SelectItem key={index} value={formation.name}>
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
            isEdited={isEdited}
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
              <SelectTrigger className="w-8 -translate-x-1 -translate-y-1 -rotate-90 rounded-br-none bg-green-50 md:w-40 md:translate-x-0 md:translate-y-0 md:rotate-0 md:rounded-tr-none">
                <SelectValue placeholder="Formation" />
              </SelectTrigger>
              <SelectContent className="absolute top-full z-50 w-40 -translate-x-1/2 md:translate-x-0">
                {formations.map((formation, index) => {
                  return (
                    <SelectItem key={index} value={formation.name}>
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
            isEdited={isEdited}
          />
        </>
      </FieldLayout>
      <div className="relative z-10 flex h-8 w-80 justify-between bg-green-700 md:h-16 md:w-[640px]">
        <OffFieldPlayers
          match={match}
          homeTeam={true}
          starPlayerId={starPlayerId}
          isEdited={isEdited}
        />
        <OffFieldPlayers
          match={match}
          homeTeam={false}
          starPlayerId={starPlayerId}
          isEdited={isEdited}
        />
      </div>
    </div>
  );
}
