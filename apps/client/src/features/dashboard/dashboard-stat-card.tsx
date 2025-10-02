import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface DashboardStatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconClassName?: string;
}

export default function DashboardStatCard({
  title,
  value,
  icon: Icon,
  iconClassName = "bg-accent/20 text-accent",
}: DashboardStatCardProps) {
  return (
    <div className="relative rounded-lg border-2 border-accent/60 bg-panel-bg p-4 shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-accent/50 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400 sm:text-sm">
            {title}
          </h3>
          <p className="mt-1 text-xl font-bold text-accent sm:text-2xl">
            {value}
          </p>
        </div>
        <div className={cn("rounded-full p-2 sm:p-3", iconClassName)}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>
    </div>
  );
}
