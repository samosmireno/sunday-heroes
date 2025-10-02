import { createContext, useContext } from "react";
import { useMultiStepForm } from "./use-multi-step-form";
import { z } from "zod";

export const MultiStepFormContext = createContext<ReturnType<
  typeof useMultiStepForm
> | null>(null);

export function useMultiStepFormContext<Schema extends z.ZodType>() {
  const context = useContext(MultiStepFormContext) as ReturnType<
    typeof useMultiStepForm<Schema>
  >;
  if (!context) {
    throw new Error(
      "useMultiStepFormContext must be used within a MultiStepForm",
    );
  }
  return context;
}
