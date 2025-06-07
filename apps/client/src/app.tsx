import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CompetitionPage from "./pages/competition-page.tsx";
import LoginPage from "./pages/login";
import ErrorPage from "./pages/error-page";
import ProtectedRoute from "./pages/protected-route";
import { AuthProvider } from "./context/auth-context.tsx";
import AuthCallback from "./pages/auth-callback.tsx";
import Dashboard from "./pages/dashboard.tsx";
import CreateCompetitionForm from "./pages/create-competition-form.tsx";
import CompetitionListPage from "./pages/competition-list-page.tsx";
import VotePage from "./pages/vote-page.tsx";
import AdminPendingVotes from "./pages/pending-votes-page.tsx";
import MatchesPage from "./pages/matches-page.tsx";
import VotesPage from "./pages/votes-page.tsx";
import AddMatchForm from "./pages/add-match-form-page.tsx";
import PlayersPage from "./pages/players-page.tsx";
import InvitationPage from "./pages/invitation-page.tsx";
import CompetitionAdminPage from "./pages/competition-admin-page.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/vote/:matchId" element={<VotePage />} />
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
                <CompetitionPage />
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
                <AddMatchForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-match/:competitionId/:matchId"
            element={
              <ProtectedRoute>
                <AddMatchForm />
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
            path="/voting"
            element={
              <ProtectedRoute>
                <VotesPage />
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
    </BrowserRouter>
  );
}
