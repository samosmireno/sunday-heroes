import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "@/pages/landing-page";
import ErrorPage from "@/pages/error-page";
import ProtectedRoute from "@/layouts/protected-route";
import { AuthProvider } from "@/context/auth-context";
import AuthCallback from "@/pages/auth-callback";
import Dashboard from "@/pages/dashboard";
import CreateCompetitionForm from "@/pages/create-competition-form";
import CompetitionListPage from "@/pages/competition-list/competition-list-page";
import VotePage from "@/pages/vote-page";
import AdminPendingVotes from "@/pages/pending-votes-page";
import MatchesPage from "@/pages/matches-page";
import PlayersPage from "@/pages/players/players-page";
import InvitationPage from "@/pages/invitation-page";
import CompetitionAdminPage from "@/pages/competition-admin-page";
import LeagueRouter from "@/features/league/league-router";
import { GlobalErrorBoundary } from "@/components/error/global-error-boundary";
import AddMatchPage from "./pages/add-match-page";
import EditMatchPage from "./pages/edit-match-page";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import ForgotPasswordPage from "./pages/forgot-password-page";
import ResetPasswordPage from "./pages/reset-password-page";
import PlayerStatsPage from "./pages/player-stats-page";
import PublicLayout from "./layouts/public-layout";

const publicRoutes = [
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/landing", element: <LandingPage /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  { path: "/player-stats/:playerId", element: <PlayerStatsPage /> },
  { path: "/invite/:token", element: <InvitationPage /> },
  { path: "/competition/:competitionId", element: <LeagueRouter /> },
];

const protectedRoutes = [
  { path: "/vote/:matchId", element: <VotePage /> },
  { path: "/pending/:matchId", element: <AdminPendingVotes /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/league-setup/:competitionId", element: <LeagueRouter /> },
  { path: "/create-competition/:userId", element: <CreateCompetitionForm /> },
  { path: "/add-match/:competitionId", element: <AddMatchPage /> },
  { path: "/edit-match/:competitionId/:matchId", element: <EditMatchPage /> },
  { path: "/competitions", element: <CompetitionListPage /> },
  { path: "/matches", element: <MatchesPage /> },
  { path: "/matches/:competitionId", element: <MatchesPage /> },
  { path: "/players", element: <PlayersPage /> },
  {
    path: "/competition/:competitionId/admin",
    element: <CompetitionAdminPage />,
  },
];

export default function App() {
  return (
    <BrowserRouter>
      <GlobalErrorBoundary>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {publicRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={<PublicLayout>{element}</PublicLayout>}
              />
            ))}
            {protectedRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={<ProtectedRoute>{element}</ProtectedRoute>}
              />
            ))}
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </AuthProvider>
      </GlobalErrorBoundary>
    </BrowserRouter>
  );
}
