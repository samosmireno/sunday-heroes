import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface AccessDeniedProps {
  onNavigate: () => void;
}

export function AccessDenied({ onNavigate }: AccessDeniedProps) {
  return (
    <div className="relative flex flex-1 items-center justify-center p-3 sm:p-4 md:p-5 lg:p-6">
      <div className="w-full max-w-sm rounded-lg border-2 border-red-500 bg-panel-bg p-4 text-center shadow-lg sm:max-w-md sm:p-6">
        <AlertTriangle
          size={32}
          className="mx-auto mb-3 text-red-500 sm:mb-4 sm:size-12"
        />
        <h2 className="mb-3 text-lg font-bold text-red-500 sm:mb-4 sm:text-xl">
          Access Denied
        </h2>
        <p className="mb-4 text-sm text-gray-200 sm:text-base">
          You don't have admin privileges for this competition.
        </p>
        <Button
          onClick={onNavigate}
          className="w-full bg-accent/20 text-accent hover:bg-accent/30 sm:w-auto"
        >
          Back to Competition
        </Button>
      </div>
    </div>
  );
}
