import React from "react";
import { Info, LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface InfoBoxProps {
  title: string;
  icon?: LucideIcon;
  variant?: "info" | "warning" | "success" | "error";
  className?: string;
  width?: string;
  children: React.ReactNode;
}

export const InfoBox = ({
  title,
  icon: Icon = Info,
  variant = "info",
  className,
  children,
}: InfoBoxProps) => {
  const variantStyles = {
    info: "border-accent/30 bg-bg/20 text-accent",
    warning: "border-amber-500/30 bg-amber-950/20 text-amber-400",
    success: "border-emerald-500/30 bg-emerald-950/20 text-emerald-400",
    error: "border-red-500/30 bg-red-950/20 text-red-400",
  };

  return (
    <div
      className={cn(
        "rounded-lg border-2 p-3 sm:p-4",
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-2 text-sm text-gray-300">{children}</div>
        </div>
      </div>
    </div>
  );
};
