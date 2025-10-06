import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import Loading from "@/components/ui/loading";
import ErrorPage from "./error-page";
import Background from "@/components/ui/background";
import { useAuth } from "@/context/auth-context";
import { useInvitation } from "@/features/invitation/hooks/use-invitation";
import { useAcceptInvitation } from "@/features/invitation/hooks/use-accept-invitation";
import { config } from "@/config/config";
import InvitationDetails from "@/features/invitation/invitation-details";
import InvitationActions from "@/features/invitation/invitation-actions";
import { UserResponse } from "@repo/shared-types";

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth() as { user: UserResponse };

  const { data: invitation, isLoading, error } = useInvitation(token);
  const acceptMutation = useAcceptInvitation();

  const handleAccept = () => {
    if (token) {
      acceptMutation.mutate(token);
    }
  };

  const handleGoogleAuth = () => {
    if (token) {
      const googleAuthUrl = `${config.google.authEndpoint}?client_id=${config.google.clientId}&redirect_uri=${config.redirect_uri}&response_type=code&scope=email profile&state=${token}`;
      window.location.href = googleAuthUrl;
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
          <InvitationDetails invitation={invitation} />
          <InvitationActions
            user={user}
            isAccepting={acceptMutation.isPending}
            onAccept={handleAccept}
            onGoogleAuth={handleGoogleAuth}
          />
        </CardContent>
      </Card>
    </div>
  );
}
