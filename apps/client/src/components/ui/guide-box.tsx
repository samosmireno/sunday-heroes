import React from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/utils/cn";

interface GuideBoxProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

export const GuideBox = ({ title, children, className }: GuideBoxProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border-2 border-accent/50 bg-panel-bg p-3 shadow-lg sm:p-4",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start">
        <div className="mb-2 flex-shrink-0 sm:mb-0 sm:mr-3">
          <HelpCircle className="h-5 w-5 text-accent/70" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-accent">{title}</h3>
          <div className="mt-2 text-sm text-gray-300">{children}</div>
        </div>
      </div>
    </div>
  );
};
