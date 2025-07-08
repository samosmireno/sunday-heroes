import { MatchType } from "@repo/shared-types";

export interface Formation {
  name: string;
  formation: { [key: number]: [number, number] };
}

interface MatchTypeFormations {
  [key: string]: Formation[];
}

const formations_5_players: Formation[] = [
  {
    name: "The Anchor",
    formation: {
      0: [5, 48],
      1: [20, 28],
      2: [20, 68],
      3: [40, 38],
      4: [40, 58],
    },
  },
  {
    name: "The Wall",
    formation: {
      0: [5, 48],
      1: [25, 28],
      2: [25, 48],
      3: [25, 68],
      4: [40, 48],
    },
  },
  {
    name: "The Y",
    formation: {
      0: [5, 48],
      1: [20, 48],
      2: [30, 48],
      3: [40, 68],
      4: [40, 28],
    },
  },
  {
    name: "The Pyramid",
    formation: {
      0: [5, 48],
      1: [20, 28],
      2: [20, 68],
      3: [30, 48],
      4: [40, 48],
    },
  },
  {
    name: "Diamond",
    formation: {
      0: [5, 48],
      1: [20, 48],
      2: [30, 28],
      3: [30, 68],
      4: [40, 48],
    },
  },
];

const formations_6_players: {
  name: string;
  formation: { [key: number]: [number, number] };
}[] = [
  {
    name: "The Tree",
    formation: {
      0: [5, 48],
      1: [20, 28],
      2: [20, 68],
      3: [30, 38],
      4: [30, 58],
      5: [40, 48],
    },
  },
  {
    name: "The Wall",
    formation: {
      0: [5, 48],
      1: [20, 28],
      2: [20, 48],
      3: [20, 68],
      4: [30, 48],
      5: [40, 48],
    },
  },
  {
    name: "The Five",
    formation: {
      0: [5, 48],
      1: [20, 28],
      2: [20, 68],
      3: [30, 48],
      4: [40, 28],
      5: [40, 68],
    },
  },
  {
    name: "The Overload",
    formation: {
      0: [5, 48],
      1: [20, 48],
      2: [30, 28],
      3: [30, 68],
      4: [40, 28],
      5: [40, 68],
    },
  },
  {
    name: "Diamond",
    formation: {
      0: [5, 48],
      1: [20, 48],
      2: [30, 28],
      3: [30, 48],
      4: [30, 68],
      5: [40, 48],
    },
  },
];

const matchTypeFormations: MatchTypeFormations = {
  [MatchType.FIVE_A_SIDE]: formations_5_players,
  [MatchType.SIX_A_SIDE]: formations_6_players,
};

export function getNumPlayersOnField(matchType: MatchType): number {
  const formations = matchTypeFormations[matchType];
  if (formations && formations.length > 0) {
    return Object.keys(formations[0].formation).length;
  }
  return 0;
}

export default matchTypeFormations;
