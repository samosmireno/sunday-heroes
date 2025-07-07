import { useCallback, useMemo, useState } from "react";
import { Path, UseFormReturn } from "react-hook-form";
import { z } from "zod";

export function useMultiStepForm<Schema extends z.ZodType>(
  schema: Schema,
  form: UseFormReturn<z.infer<Schema>>,
  stepNames: string[],
) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">();

  const checkStepValid = useCallback(
    (stepIndex: number) => {
      const stepName = stepNames[stepIndex] as Path<z.TypeOf<Schema>>;

      if (schema instanceof z.ZodObject) {
        const stepSchema = schema.shape[stepName] as z.ZodType;

        if (!stepSchema) {
          return true;
        }

        const stepData = form.getValues(stepName) ?? {};
        //console.log("stepData: ", stepData);
        const result = stepSchema.safeParse(stepData);
        //console.log(result.error);

        return result.success;
      }

      throw new Error(`Unsupported schema type: ${schema.constructor.name}`);
    },
    [schema, form, stepNames],
  );

  const isStepValid = useCallback(
    () => checkStepValid(currentStepIndex),
    [checkStepValid, currentStepIndex],
  );

  const nextStep = useCallback(
    <Ev extends React.SyntheticEvent>(e: Ev) => {
      e.preventDefault();

      const isValid = isStepValid();
      if (!isValid) {
        const currentStepName = stepNames[currentStepIndex] as Path<
          z.TypeOf<Schema>
        >;

        if (schema instanceof z.ZodObject) {
          const currentStepSchema = schema.shape[currentStepName] as z.ZodType;

          if (currentStepSchema) {
            const fields = Object.keys(
              (currentStepSchema as z.ZodObject<never>).shape,
            );

            const keys = fields.map((field) => `${currentStepName}.${field}`);

            for (const key of keys) {
              void form.trigger(key as Path<z.TypeOf<Schema>>);
            }

            return;
          }
        }
      }

      if (isValid && currentStepIndex < stepNames.length - 1) {
        setDirection("forward");
        setCurrentStepIndex((prev) => prev + 1);
      }
    },
    [isStepValid, currentStepIndex, stepNames, schema, form],
  );

  const prevStep = useCallback(
    <Ev extends React.SyntheticEvent>(e: Ev) => {
      e.preventDefault();

      if (currentStepIndex > 0) {
        setDirection("backward");
        setCurrentStepIndex((prev) => prev - 1);
      }
    },
    [currentStepIndex],
  );

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < stepNames.length && isStepValid()) {
        setDirection(index > currentStepIndex ? "forward" : "backward");
        setCurrentStepIndex(index);
      }
    },
    [isStepValid, stepNames.length, currentStepIndex],
  );

  const isValid = form.formState.isValid;
  const errors = form.formState.errors;

  return useMemo(
    () => ({
      form,
      currentStep: stepNames[currentStepIndex] as string,
      currentStepIndex,
      totalSteps: stepNames.length,
      isFirstStep: currentStepIndex === 0,
      isLastStep: currentStepIndex === stepNames.length - 1,
      nextStep,
      prevStep,
      goToStep,
      direction,
      isStepValid,
      isValid,
      checkStepValid,
      errors,
    }),
    [
      form,
      isValid,
      errors,
      stepNames,
      currentStepIndex,
      nextStep,
      prevStep,
      goToStep,
      direction,
      isStepValid,
      checkStepValid,
    ],
  );
}
