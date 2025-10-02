import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

interface AnimatedStepProps {
  direction: "forward" | "backward" | undefined;
  isActive: boolean;
  index: number;
  currentIndex: number;
}

export function AnimatedStep({
  isActive,
  direction,
  children,
  index,
  currentIndex,
}: React.PropsWithChildren<AnimatedStepProps>) {
  const [shouldRender, setShouldRender] = useState(isActive);
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive && stepRef.current) {
      const focusableElement = stepRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusableElement) {
        (focusableElement as HTMLElement).focus();
      }
    } else if (stepRef.current) {
      const focusableElements = stepRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusableElements.forEach((element) => {
        (element as HTMLElement).blur();
      });
    }
  }, [isActive]);

  if (!shouldRender) {
    return null;
  }

  const baseClasses =
    "top-0 left-0 w-full h-full transition-all duration-300 ease-in-out animate-in fade-in zoom-in-95";
  const visibilityClasses = isActive ? "opacity-100" : "opacity-0 absolute";
  const transformClasses = cn(
    "translate-x-0",
    !isActive && (direction === "forward" || index < currentIndex)
      ? "-translate-x-full"
      : undefined,
    !isActive && (direction === "backward" || index > currentIndex)
      ? "translate-x-full"
      : undefined,
  );
  const className = cn(baseClasses, visibilityClasses, transformClasses);

  return (
    <div ref={stepRef} className={className} aria-hidden={!isActive}>
      {children}
    </div>
  );
}
