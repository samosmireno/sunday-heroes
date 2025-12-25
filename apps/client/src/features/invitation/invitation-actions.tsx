import { Button } from "@/components/ui/button";
import { UserResponse } from "@repo/shared-types";
import { useNavigate } from "react-router-dom";
import { GoogleIcon } from "@/components/icons/google";
import { config } from "@/config/config";

interface InvitationActionsProps {
  user: UserResponse;
  isAccepting: boolean;
  onAccept: () => void;
  token?: string;
  invitedBy?: string;
}

export default function InvitationActions({
  user,
  isAccepting,
  onAccept,
  token,
  invitedBy,
}: InvitationActionsProps) {
  const navigate = useNavigate();

  if (user) {
    return (
      <div className="space-y-3">
        <Button
          onClick={onAccept}
          disabled={isAccepting}
          className="w-full bg-accent text-bg hover:bg-accent/90"
        >
          {isAccepting ? "Accepting..." : "Accept Invitation"}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    );
  }

  // If user is NOT logged in, show auth options
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-center text-sm text-gray-400">
          Sign in or create an account to accept this invitation
        </p>

        <Button
          onClick={() =>
            navigate("/login", {
              state: {
                from: `/invitation/${token}`,
                inviteToken: token,
                invitedBy,
              },
            })
          }
          className="w-full bg-accent text-bg hover:bg-accent/90"
        >
          Sign In
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            navigate("/register", {
              state: {
                from: `/invitation/${token}`,
                inviteToken: token,
                invitedBy,
              },
            })
          }
          className="w-full"
        >
          Create Account
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-600" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-panel-bg px-2 text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        onClick={() => {
          const googleAuthUrl = `${config.google.authEndpoint}?client_id=${config.google.clientId}&redirect_uri=${config.redirect_uri}&response_type=code&scope=email profile&state=${token}`;
          window.location.href = googleAuthUrl;
        }}
        variant="outline"
        className="w-full"
      >
        <GoogleIcon />
        <span className="ml-2">Google</span>
      </Button>
    </div>
  );
}
