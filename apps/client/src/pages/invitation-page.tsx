import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Trophy, User, Calendar, ExternalLink } from "lucide-react";
import Loading from "../components/ui/loading";
import ErrorPage from "./error-page";
import axiosInstance from "../config/axiosConfig";
import { useAuth } from "../context/auth-context";
import { toast } from "sonner";
import { config } from "../config/config";
import Background from "../components/ui/background";

interface InvitationDetails {
  id: string;
  token: string;
  dashboardPlayer: {
    id: string;
    nickname: string;
    dashboard: {
      id: string;
      name: string;
    };
  };
  invitedBy: {
    name: string;
    email: string;
  };
  expiresAt: string;
}

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      validateInvitation();
    }
  }, [token]);

  const validateInvitation = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/invitations/${token}/validate`,
      );
      setInvitation(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || "Invalid invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!user) {
      const googleAuthUrl = `${config.google.authEndpoint}?client_id=${config.google.clientId}&redirect_uri=${config.redirect_uri}&response_type=code&scope=email profile&state=${token}`;
      window.location.href = googleAuthUrl;
      return;
    }

    setIsAccepting(true);
    try {
      await axiosInstance.post(`/api/invitations/${token}/accept`);
      toast.success("Successfully connected to player profile!");
      navigate(`/dashboard`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to accept invitation");
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return <Loading text="Validating invitation..." />;
  }

  if (error || !invitation) {
    return <ErrorPage />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Background />
      <Card className="relative w-full max-w-md border-2 border-accent/70 bg-panel-bg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
            <Trophy className="h-8 w-8 text-accent" />
          </div>
          <CardTitle className="text-xl text-accent">You're Invited!</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
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

          <div className="space-y-3">
            <Button
              onClick={handleAcceptInvitation}
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
        </CardContent>
      </Card>
    </div>
  );
}
