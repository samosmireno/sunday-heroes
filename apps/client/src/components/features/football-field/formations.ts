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

const formations_7_players: {
  name: string;
  formation: { [key: number]: [number, number] };
}[] = [
  {
    name: "Diamond",
    formation: {
      0: [5, 48],
      1: [15, 48],
      2: [25, 38],
      3: [25, 58],
      4: [35, 28],
      5: [35, 68],
      6: [45, 48],
    },
  },
  {
    name: "Balance",
    formation: {
      0: [5, 48],
      1: [15, 28],
      2: [15, 68],
      3: [25, 38],
      4: [25, 58],
      5: [35, 48],
      6: [45, 48],
    },
  },
  {
    name: "The Wall",
    formation: {
      0: [5, 48],
      1: [15, 28],
      2: [15, 48],
      3: [15, 68],
      4: [30, 38],
      5: [30, 58],
      6: [45, 48],
    },
  },
  {
    name: "The Strike",
    formation: {
      0: [5, 48],
      1: [15, 32],
      2: [15, 64],
      3: [25, 38],
      4: [25, 58],
      5: [35, 38],
      6: [35, 58],
    },
  },
  {
    name: "The Engine",
    formation: {
      0: [5, 48],
      1: [15, 48],
      2: [25, 28],
      3: [25, 48],
      4: [25, 68],
      5: [40, 38],
      6: [40, 58],
    },
  },
];

const matchTypeFormations: MatchTypeFormations = {
  [MatchType.FIVE_A_SIDE]: formations_5_players,
  [MatchType.SIX_A_SIDE]: formations_6_players,
  [MatchType.SEVEN_A_SIDE]: formations_7_players,
};

export function getNumPlayersOnField(matchType: MatchType): number {
  const formations = matchTypeFormations[matchType];
  if (formations && formations.length > 0) {
    return Object.keys(formations[0].formation).length;
  }
  return 0;
}

export default matchTypeFormations;
