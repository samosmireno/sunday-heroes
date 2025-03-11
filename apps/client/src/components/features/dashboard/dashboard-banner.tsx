import { Button } from "../../ui/button";
import { Plus } from "lucide-react";

interface DashboardBannerProps {
  onCreateClick: () => void;
}

export default function DashboardBanner({
  onCreateClick,
}: DashboardBannerProps) {
  return (
    <div className="mb-6 rounded-xl bg-green-500 p-6 text-white">
      <h1 className="mb-2 text-2xl font-bold">Welcome to your Dashboard</h1>
      <p className="font-exo text-white">
        Track your competitions, manage teams, and analyze stats in one place.
      </p>
      <Button
        onClick={onCreateClick}
        className="mt-4 flex items-center rounded-lg bg-white px-4 py-2 font-exo font-medium text-green-600"
      >
        <Plus size={18} className="mr-2" />
        Create New Competition
      </Button>
    </div>
  );
}
