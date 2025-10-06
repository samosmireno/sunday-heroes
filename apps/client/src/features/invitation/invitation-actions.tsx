import { Button } from "@/components/ui/button";
import { UserResponse } from "@repo/shared-types";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InvitationActionsProps {
  user: UserResponse;
  isAccepting: boolean;
  onAccept: () => void;
  onGoogleAuth: () => void;
}

export default function InvitationActions({
  user,
  isAccepting,
  onAccept,
  onGoogleAuth,
}: InvitationActionsProps) {
  const navigate = useNavigate();

  const handleAccept = () => {
    if (!user) {
      onGoogleAuth();
      return;
    }
    onAccept();
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleAccept}
        disabled={isAccepting}
        className="w-full bg-accent text-bg hover:bg-accent/90"
      >
        {isAccepting ? (
          "Connecting..."
        ) : user ? (
          "Accept Invitation"
        ) : (
          <>
            <ExternalLink className="mr-2 h-4 w-4" />
            Sign in with Google to Accept
          </>
        )}
      </Button>

      {user && (
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="w-full"
        >
          Cancel
        </Button>
      )}
    </div>
  );
}
