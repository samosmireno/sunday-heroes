interface RoundTabsProps {
  rounds: number[];
  activeRound: number | null;
  onRoundChange: (round: number) => void;
}

export default function RoundTabs({
  rounds,
  activeRound,
  onRoundChange,
}: RoundTabsProps) {
  return (
    <div className="border-b border-accent/30">
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
        {rounds.map((round) => (
          <button
            key={round}
            onClick={() => onRoundChange(round)}
            className={`flex-shrink-0 whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeRound === round
                ? "bg-accent text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Round {round}
          </button>
        ))}
      </div>
    </div>
  );
}
