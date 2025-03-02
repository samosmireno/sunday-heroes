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
    <div className="flex flex-row justify-center gap-4 pb-8">
      {steps.map((_step, index) => (
        <div
          key={index}
          className="flex w-24 flex-col gap-1 hover:cursor-pointer"
          onClick={() => goToStep(index)}
        >
          <div className="text-center">{steps[index]}</div>
          <div
            className={`h-2 w-full rounded-xl ${
              currentStep === index
                ? "bg-green-500"
                : checkStepValid(index)
                  ? "bg-green-500/30"
                  : "bg-gray-500/30"
            }`}
          ></div>
        </div>
      ))}
    </div>
  );
}
