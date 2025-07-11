import { DuelMatchPlayersForm } from "@repo/shared-types";

export default function swapMatchPlayers(
  matchPlayers: DuelMatchPlayersForm,
  activeId: string,
  overId: string,
) {
  if (!matchPlayers?.players) return null;

  const newMatchPlayers = structuredClone(matchPlayers);
  const oldIndex = newMatchPlayers.players.findIndex(
    (player) => player?.nickname === activeId,
  );
  const newIndex = newMatchPlayers.players.findIndex(
    (player) => player?.nickname === overId,
  );

  if (oldIndex === -1 || newIndex === -1) return null;

  const oldPosition = newMatchPlayers.players[oldIndex].position;
  const newPosition = newMatchPlayers.players[newIndex].position;

  [newMatchPlayers.players[oldIndex], newMatchPlayers.players[newIndex]] = [
    newMatchPlayers.players[newIndex],
    newMatchPlayers.players[oldIndex],
  ];

  newMatchPlayers.players[oldIndex].position = oldPosition;
  newMatchPlayers.players[newIndex].position = newPosition;

  return newMatchPlayers;
}
