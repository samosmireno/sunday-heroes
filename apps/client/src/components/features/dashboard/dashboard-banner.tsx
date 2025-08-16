import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { PlusCircle } from "lucide-react";
import { SidebarTrigger } from "../../ui/sidebar";
import { capitalizeFirstLetter } from "../../../utils/utils";

interface DashboardBannerProps {
  name?: string;
  onCreateClick: () => void;
  className?: string;
}

export default function DashboardBanner({
  name,
  onCreateClick,
  className,
}: DashboardBannerProps) {
  return (
    <div className={cn("flex items-center p-4 sm:p-6", className)}>
      <SidebarTrigger className="mr-3" />
      <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
        <div>
          <h2 className="text-xl font-bold text-gray-200">
            Welcome{name ? `, ${capitalizeFirstLetter(name)}` : ""}!
          </h2>
          <p className="text-sm text-gray-400 sm:text-base">
            Track your football competitions, matches, and player stats
          </p>
        </div>
        <Button
          onClick={onCreateClick}
          className="w-full transform rounded bg-accent px-4 py-2 font-bold uppercase text-bg shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-bg sm:w-auto"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          New Competition
        </Button>
      </div>
    </div>
  );
}
