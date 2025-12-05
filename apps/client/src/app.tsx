import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "@/pages/landing-page.tsx";
import ErrorPage from "@/pages/error-page";
import ProtectedRoute from "@/layouts/protected-route";
import { AuthProvider } from "@/context/auth-context.tsx";
import AuthCallback from "@/pages/auth-callback.tsx";
import Dashboard from "@/pages/dashboard";
import CreateCompetitionForm from "@/pages/create-competition-form.tsx";
import CompetitionListPage from "@/pages/competition-list/competition-list-page.tsx";
import VotePage from "@/pages/vote-page";
import AdminPendingVotes from "@/pages/pending-votes-page";
import MatchesPage from "@/pages/matches-page";
import PlayersPage from "@/pages/players/players-page.tsx";
import InvitationPage from "@/pages/invitation-page.tsx";
import CompetitionAdminPage from "@/pages/competition-admin-page";
import LeagueRouter from "@/features/league/league-router";
import { GlobalErrorBoundary } from "@/components/error/global-error-boundary";
import AddMatchPage from "./pages/add-match-page";
import EditMatchPage from "./pages/edit-match-page";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";

export default function App() {
  return (
    <BrowserRouter>
      <GlobalErrorBoundary>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/landing" element={<LandingPage />} />

            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route
              path="/vote/:matchId"
              element={
                <ProtectedRoute>
                  <VotePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pending/:matchId"
              element={
                <ProtectedRoute>
                  <AdminPendingVotes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/competition/:competitionId"
              element={
                <ProtectedRoute>
                  <LeagueRouter />
                </ProtectedRoute>
              }
            />

            <Route
              path="/league-setup/:competitionId"
              element={
                <ProtectedRoute>
                  <LeagueRouter />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-competition/:userId"
              element={
                <ProtectedRoute>
                  <CreateCompetitionForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-match/:competitionId"
              element={
                <ProtectedRoute>
                  <AddMatchPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-match/:competitionId/:matchId"
              element={
                <ProtectedRoute>
                  <EditMatchPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/competitions"
              element={
                <ProtectedRoute>
                  <CompetitionListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/matches"
              element={
                <ProtectedRoute>
                  <MatchesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/matches/:competitionId"
              element={
                <ProtectedRoute>
                  <MatchesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/players"
              element={
                <ProtectedRoute>
                  <PlayersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/competition/:competitionId/admin"
              element={
                <ProtectedRoute>
                  <CompetitionAdminPage />
                </ProtectedRoute>
              }
            />

            <Route path="/invite/:token" element={<InvitationPage />} />

            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </AuthProvider>
      </GlobalErrorBoundary>
    </BrowserRouter>
  );
}
