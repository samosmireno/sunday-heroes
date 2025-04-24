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
  const { goToStep, checkStepValid } = useMultiStepFormContext();

  useEffect(() => {}, []);

  return (
    <div className="relative mb-6 w-full">
      <div className="flex items-center justify-between">
        {steps.map((_step, index) => (
          <div
            key={index}
            className="flex flex-1 flex-col items-center hover:cursor-pointer"
            onClick={() => goToStep(index)}
          >
            <div className="text-center">{steps[index]}</div>
            <div
              className={`h-2 w-full rounded-xl ${
                currentStep === index
                  ? "border-accent bg-accent text-accent"
                  : checkStepValid(index)
                    ? "border-accent/50 bg-accent/20 text-gray-300 hover:bg-accent/40"
                    : "border-accent/30 bg-bg/30 text-gray-400"
              }`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}
