import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface DashboardStatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  info?: string;
  type?: "info" | "alert";
}

const typeStyles = {
  info: {
    card: "border-accent/60",
    icon: "bg-accent/20 text-accent",
    popover: "border-accent/60 bg-panel-bg text-gray-200",
    iconBorder: "border-transparent hover:border-accent/30",
  },
  alert: {
    card: "border-red-700/60",
    icon: "bg-red-700/40 text-accent",
    popover: "border-red-700/60 bg-panel-bg text-gray-200",
    iconBorder: "border-transparent hover:border-red-700/40",
  },
};

export default function DashboardStatCard({
  title,
  value,
  icon: Icon,
  info,
  type = "info",
}: DashboardStatCardProps) {
  const styles = typeStyles[type];

  return (
    <div
      className={cn(
        "rounded-lg border-2 bg-panel-bg p-4 shadow-md transition-all duration-300 hover:shadow-lg",
        styles.card,
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400 sm:text-sm">
            {title}
          </h3>
          <p className="mt-1 text-xl font-bold text-accent sm:text-2xl">
            {value}
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <div
              className={cn(
                "cursor-pointer rounded-full border-2 p-2 outline-none ring-0 transition-colors sm:p-3",
                styles.icon,
                styles.iconBorder,
                "focus-visible:bg-opacity-80 focus-visible:ring-2 focus-visible:ring-accent",
              )}
              tabIndex={0}
              aria-label="Show info"
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </PopoverTrigger>
          {info && (
            <PopoverContent
              side="left"
              className={cn(
                "max-w-xs rounded-lg border-2 p-4 text-center text-sm shadow-md",
                styles.popover,
              )}
            >
              {info}
            </PopoverContent>
          )}
        </Popover>
      </div>
    </div>
  );
}
