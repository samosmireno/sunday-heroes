import React from "react";
import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { MultiStepFormStep } from "./multi-step-form-step";
import { MultiStepFormHeader } from "./multi-step-form-header";
import { MultiStepFormFooter } from "./multi-step-form-footer";
import { useMultiStepForm } from "./use-multi-step-form";
import {
  MultiStepFormContext,
  useMultiStepFormContext,
} from "./multi-step-form-context";
import { cn } from "@/utils/cn";
import { AnimatedStep } from "./animated-step";

interface MultiStepFormProps<T extends z.ZodType> {
  schema: T;
  form: UseFormReturn<z.infer<T>>;
  onSubmit: (data: z.infer<T>) => void;
  useStepTransition?: boolean;
  className?: string;
  children: React.ReactNode;
}

type StepProps = React.PropsWithChildren<
  {
    name: string;
    asChild?: boolean;
  } & React.HTMLProps<HTMLDivElement>
>;

export function MultiStepFormContextProvider(props: {
  children: (context: ReturnType<typeof useMultiStepForm>) => React.ReactNode;
}) {
  const ctx = useMultiStepFormContext();
  if (Array.isArray(props.children)) {
    const [child] = props.children;
    return (
      child as (context: ReturnType<typeof useMultiStepForm>) => React.ReactNode
    )(ctx);
  }
  return props.children(ctx);
}

export function MultiStepForm<T extends z.ZodType>({
  schema,
  form,
  onSubmit,
  children,
  className,
}: MultiStepFormProps<T>) {
  const steps = useMemo(
    () =>
      React.Children.toArray(children).filter(
        (child): child is React.ReactElement<StepProps> =>
          React.isValidElement(child) && child.type === MultiStepFormStep,
      ),
    [children],
  );

  const header = useMemo(() => {
    return React.Children.toArray(children).find(
      (child) =>
        React.isValidElement(child) && child.type === MultiStepFormHeader,
    );
  }, [children]);
  const footer = useMemo(() => {
    return React.Children.toArray(children).find(
      (child) =>
        React.isValidElement(child) && child.type === MultiStepFormFooter,
    );
  }, [children]);

  const stepNames = steps.map((step) => step.props.name);
  const multiStepForm = useMultiStepForm(schema, form, stepNames);
  return (
    <MultiStepFormContext.Provider value={multiStepForm}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(className, "flex size-full flex-col overflow-hidden")}
      >
        {header}
        <div className="relative transition-transform duration-500">
          {steps.map((step, index) => {
            const isActive = index === multiStepForm.currentStepIndex;
            return (
              <AnimatedStep
                key={step.props.name}
                direction={multiStepForm.direction}
                isActive={isActive}
                index={index}
                currentIndex={multiStepForm.currentStepIndex}
              >
                {step}
              </AnimatedStep>
            );
          })}
        </div>
        {footer}
      </form>
    </MultiStepFormContext.Provider>
  );
}
