import { createContext, useContext, ReactNode } from "react";
import { CompetitionResponse } from "@repo/shared-types";

interface CompetitionContextType {
  competition: CompetitionResponse | null;
  isLoading: boolean;
  refetch: () => void;
}

const CompetitionContext = createContext<CompetitionContextType | undefined>(
  undefined,
);

interface CompetitionProviderProps {
  children: ReactNode;
  value: CompetitionContextType;
}

export function CompetitionProvider({
  children,
  value,
}: CompetitionProviderProps) {
  return (
    <CompetitionContext.Provider value={value}>
      {children}
    </CompetitionContext.Provider>
  );
}

export function useCompetitionContext() {
  const context = useContext(CompetitionContext);
  if (context === undefined) {
    throw new Error("useCompetition must be used within a CompetitionProvider");
  }
  return context;
}
