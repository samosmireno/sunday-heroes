import { cn } from "@/utils/cn";
interface StepTransitionProps {
  direction: "forward" | "backward" | undefined;
  isActive: boolean;
  children: React.ReactNode;
}

export default function StepTransition({
  direction,
  isActive,
  children,
}: StepTransitionProps) {
  const baseClasses =
    "transition-all motion-reduce:transition-none duration-300 ease-in-out flex-shrink-0";

  const activeClasses = isActive
    ? "opacity-100 translate-x-0 h-full"
    : "opacity-0 pointer-events-none absolute";

  const directionClasses = isActive
    ? ""
    : direction === "forward"
      ? "-translate-x-full"
      : "translate-x-full";
  const className = cn(baseClasses, activeClasses, directionClasses);
  return <div className={className}>{children}</div>;
}
