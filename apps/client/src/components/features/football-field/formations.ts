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

const formations_11_players: Formation[] = [
  {
    name: "4-4-2",
    formation: {
      0: [5, 48], // Goalkeeper
      1: [15, 20], // Left Back
      2: [15, 38], // Left Center Back
      3: [15, 58], // Right Center Back
      4: [15, 76], // Right Back
      5: [30, 20], // Left Midfielder
      6: [30, 38], // Left Center Mid
      7: [30, 58], // Right Center Mid
      8: [30, 76], // Right Midfielder
      9: [45, 40], // Left Forward
      10: [45, 56], // Right Forward
    },
  },
  {
    name: "3-5-2",
    formation: {
      0: [5, 48], // Goalkeeper
      1: [15, 30], // Left Center Back
      2: [15, 48], // Center Back
      3: [15, 66], // Right Center Back
      4: [25, 20], // Left Wing Back
      5: [30, 35], // Left Center Mid
      6: [30, 48], // Center Mid
      7: [30, 61], // Right Center Mid
      8: [25, 76], // Right Wing Back
      9: [45, 40], // Left Forward
      10: [45, 56], // Right Forward
    },
  },
  {
    name: "5-4-1",
    formation: {
      0: [5, 48], // Goalkeeper
      1: [15, 20], // Left Wing Back
      2: [15, 33], // Left Center Back
      3: [15, 48], // Center Back
      4: [15, 63], // Right Center Back
      5: [15, 76], // Right Wing Back
      6: [30, 20], // Left Midfielder
      7: [30, 38], // Left Center Mid
      8: [30, 58], // Right Center Mid
      9: [30, 76], // Right Midfielder
      10: [45, 48], // Forward
    },
  },
  {
    name: "3-4-3",
    formation: {
      0: [5, 48], // Goalkeeper
      1: [15, 30], // Left Center Back
      2: [15, 48], // Center Back
      3: [15, 66], // Right Center Back
      4: [30, 25], // Left Midfielder
      5: [30, 40], // Left Center Mid
      6: [30, 56], // Right Center Mid
      7: [30, 71], // Right Midfielder
      8: [45, 30], // Left Forward
      9: [45, 48], // Center Forward
      10: [45, 66], // Right Forward
    },
  },
  {
    name: "4-2-3-1",
    formation: {
      0: [5, 48], // Goalkeeper
      1: [15, 20], // Left Back
      2: [15, 38], // Left Center Back
      3: [15, 58], // Right Center Back
      4: [15, 76], // Right Back
      5: [25, 40], // Left Defensive Mid
      6: [25, 56], // Right Defensive Mid
      7: [35, 30], // Left Attacking Mid
      8: [35, 48], // Center Attacking Mid
      9: [35, 66], // Right Attacking Mid
      10: [45, 48], // Forward
    },
  },
];

const matchTypeFormations: MatchTypeFormations = {
  [MatchType.FIVE_A_SIDE]: formations_5_players,
  [MatchType.SIX_A_SIDE]: formations_6_players,
  [MatchType.SEVEN_A_SIDE]: formations_7_players,
  [MatchType.ELEVEN_A_SIDE]: formations_11_players,
};

export function getNumPlayersOnField(matchType: MatchType): number {
  const formations = matchTypeFormations[matchType];
  if (formations && formations.length > 0) {
    return Object.keys(formations[0].formation).length;
  }
  return 0;
}

export default matchTypeFormations;
