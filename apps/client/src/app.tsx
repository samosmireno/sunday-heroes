import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
import AddMatchForm from "./pages/add-match-form-page.tsx";
import PlayersPage from "./pages/players-page.tsx";
import InvitationPage from "./pages/invitation-page.tsx";
import CompetitionAdminPage from "./pages/competition-admin-page.tsx";
import LeagueRouter from "./components/features/league/league-router.tsx";
import { GlobalErrorBoundary } from "./components/features/error-boundary/global-error-boundary.tsx";
import { PageErrorBoundary } from "./components/features/error-boundary/page-error-boundary.tsx";
import { ErrorTest } from "./components/test-components/error-test.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <GlobalErrorBoundary>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/vote/:matchId"
              element={
                <PageErrorBoundary pageName="Vote">
                  <ProtectedRoute>
                    <VotePage />
                  </ProtectedRoute>
                </PageErrorBoundary>
              }
            />
            <Route
              path="/pending/:matchId"
              element={
                <PageErrorBoundary pageName="Pending Votes">
                  <ProtectedRoute>
                    <AdminPendingVotes />
                  </ProtectedRoute>
                </PageErrorBoundary>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PageErrorBoundary pageName="Dashboard">
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </PageErrorBoundary>
              }
            />
            <Route
              path="/competition/:competitionId"
              element={
                <PageErrorBoundary pageName="Competition">
                  <ProtectedRoute>
                    <LeagueRouter />
                  </ProtectedRoute>
                </PageErrorBoundary>
              }
            />
            <Route
              path="/league-setup/:competitionId"
              element={
                <PageErrorBoundary pageName="League Setup">
                  <ProtectedRoute>
                    <LeagueRouter />
                  </ProtectedRoute>
                </PageErrorBoundary>
              }
            />
            <Route
              path="/invite/:token"
              element={
                <PageErrorBoundary pageName="Invitation">
                  <InvitationPage />
                </PageErrorBoundary>
              }
            />
            <Route
              path="/competition-admin/:competitionId"
              element={
                <PageErrorBoundary pageName="Competition Admin">
                  <ProtectedRoute>
                    <CompetitionAdminPage />
                  </ProtectedRoute>
                </PageErrorBoundary>
              }
            />
            <Route
              path="/create-competition"
              element={
                <PageErrorBoundary pageName="Create Competition">
                  <ProtectedRoute>
                    <CreateCompetitionForm />
                  </ProtectedRoute>
                </PageErrorBoundary>
              }
            />
            <Route
              path="/competitions"
              element={
                <PageErrorBoundary pageName="Competitions">
                  <ProtectedRoute>
                    <CompetitionListPage />
                  </ProtectedRoute>
                </PageErrorBoundary>
              }
            />
            <Route
              path="/matches"
              element={
                <PageErrorBoundary pageName="Matches">
                  <ProtectedRoute>
                    <MatchesPage />
                  </ProtectedRoute>
                </PageErrorBoundary>
              }
            />
            <Route
              path="/add-match"
              element={
                <PageErrorBoundary pageName="Add Match">
                  <ProtectedRoute>
                    <AddMatchForm />
                  </ProtectedRoute>
                </PageErrorBoundary>
              }
            />
            <Route
              path="/players"
              element={
                <PageErrorBoundary pageName="Players">
                  <ProtectedRoute>
                    <PlayersPage />
                  </ProtectedRoute>
                </PageErrorBoundary>
              }
            />
            {process.env.NODE_ENV === "development" && (
              <Route
                path="/test-errors"
                element={
                  <PageErrorBoundary pageName="TestError">
                    <ErrorTest />
                  </PageErrorBoundary>
                }
              />
            )}
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </AuthProvider>
      </GlobalErrorBoundary>
    </BrowserRouter>
  );
}
