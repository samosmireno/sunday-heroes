import { InvitationResponse } from "@repo/shared-types";
import { User, Trophy, Calendar } from "lucide-react";

interface InvitationDetailsProps {
  invitation: InvitationResponse;
}

export default function InvitationDetails({
  invitation,
}: InvitationDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-bg/40 p-4">
        <h3 className="font-semibold text-gray-200">
          {invitation.dashboardPlayer.dashboard.name}
        </h3>
        <p className="text-sm text-gray-400">Dashboard</p>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-300">
        <User className="h-4 w-4" />
        <span>
          Connect to player:{" "}
          <strong>{invitation.dashboardPlayer.nickname}</strong>
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-300">
        <Trophy className="h-4 w-4" />
        <span>Invited by {invitation.invitedBy.name}</span>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-400">
        <Calendar className="h-4 w-4" />
        <span>
          Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
