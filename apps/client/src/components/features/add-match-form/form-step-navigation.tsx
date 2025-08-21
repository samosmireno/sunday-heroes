import { useEffect } from "react";
import { useMultiStepFormContext } from "../multi-step-form/multi-step-form-context";

interface StepNavigationProps {
  steps: string[];
  currentStep: number;
}

export default function StepNavigation({
  steps,
  currentStep,
}: StepNavigationProps) {
  const { goToStep } = useMultiStepFormContext();

  useEffect(() => {}, []);

  return (
    <div className="relative mb-4 w-full sm:mb-6">
      <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-4">
        {steps.map((_step, index) => (
          <div
            key={index}
            className="flex flex-1 flex-col items-center hover:cursor-pointer"
            onClick={() => goToStep(index)}
          >
            <div className="mb-2 text-center text-xs font-medium sm:mb-3 sm:text-sm md:text-base">
              <span className="inline">{steps[index]}</span>
            </div>
            <div
              className={`h-1 w-full rounded-xl transition-all duration-200 sm:h-2 ${
                currentStep === index
                  ? "border-accent bg-accent text-accent"
                  : "border-accent/50 bg-accent/20 text-gray-300 hover:bg-accent/40"
              }`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}
