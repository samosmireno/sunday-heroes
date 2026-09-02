// PROTOTYPE — throwaway. The All Matches / Admin buttons the real League
// page has, carrying the prototype's search params across pages.
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, Settings } from "lucide-react";
import { Role } from "@repo/shared-types";
import { Button } from "@/components/ui/button";
import { ProtoModel } from "./fake-seasons";

const CARRIED = ["variant", "proto", "state", "role", "season"];

export function useCarriedParams() {
  const [searchParams] = useSearchParams();
  const carried = new URLSearchParams();
  CARRIED.forEach((k) => {
    const v = searchParams.get(k);
    if (v) carried.set(k, v);
  });
  const qs = carried.toString();
  return qs ? `?${qs}` : "";
}

export default function LeagueActions({ model }: { model: ProtoModel }) {
  const navigate = useNavigate();
  const qs = useCarriedParams();
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
      <Button onClick={() => navigate(`/matches/${model.id}${qs}`)} className="w-full border-2 border-accent/40 bg-bg/30 text-gray-300 hover:bg-accent/10 sm:w-auto" size="sm">
        <Calendar className="mr-2 h-4 w-4" />
        <span className="text-sm sm:text-base">All Matches</span>
      </Button>
      {model.userRole === Role.ADMIN && (
        <Button onClick={() => navigate(`/competition/${model.id}/admin`)} className="w-full border-2 border-amber-500/40 bg-amber-900/20 text-amber-400 hover:bg-amber-900/30 sm:w-auto" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          <span className="text-sm sm:text-base">Admin</span>
        </Button>
      )}
    </div>
  );
}
