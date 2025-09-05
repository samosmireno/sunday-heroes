import { useCallback, useMemo, useState } from "react";
import { Path, UseFormReturn } from "react-hook-form";
import { z } from "zod";

const extractZodObjectSchema = (schema: z.ZodType) => {
  // Handle ZodObject directly
  if (schema instanceof z.ZodObject) {
    return schema;
  }

  // Handle ZodEffects (refined schemas)
  if (schema instanceof z.ZodEffects) {
    return extractZodObjectSchema(schema._def.schema);
  }

  // Handle other wrapper types if needed
  if ("_def" in schema && "innerType" in schema._def) {
    const innerType = schema._def.innerType;
    if (innerType instanceof z.ZodType) {
      return extractZodObjectSchema(innerType);
    }
  }

  return null;
};

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

      const objectSchema = extractZodObjectSchema(schema);

      if (objectSchema) {
        const stepSchema = objectSchema.shape[stepName] as z.ZodType;

        if (!stepSchema) {
          return true;
        }

        const stepData = form.getValues(stepName) ?? {};
        const result = stepSchema.safeParse(stepData);

        return result.success;
      }

      throw new Error(`Unsupported schema type: ${schema.constructor.name}`);
    },
    [schema, form, stepNames],
  );

  const checkFinalValid = useCallback(() => {
    const wholeSchemaResult = schema.safeParse(form.getValues());
    return wholeSchemaResult.success;
  }, [schema, form]);

  const isStepValid = useCallback(() => {
    const stepValid = checkStepValid(currentStepIndex);
    const isLastStep = currentStepIndex === stepNames.length - 1;

    // On last step, also check whole schema
    if (isLastStep) {
      return stepValid && checkFinalValid();
    }

    return stepValid;
  }, [checkStepValid, checkFinalValid, currentStepIndex, stepNames.length]);

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
      checkFinalValid,
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
      checkFinalValid,
    ],
  );
}
