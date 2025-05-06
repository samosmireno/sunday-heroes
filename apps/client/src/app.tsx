import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CompetitionPage from "./pages/competition-page.tsx";
import LoginPage from "./pages/login";
import ErrorPage from "./pages/error-page";
import ProtectedRoute from "./pages/protected-route";
import AddMultiForm from "./pages/add-multi-form";
import { AuthProvider } from "./context/auth-context.tsx";
import AuthCallback from "./pages/auth-callback.tsx";
import Dashboard from "./pages/dashboard.tsx";
import CreateCompetitionForm from "./pages/create-competition-form.tsx";
import CompetitionListPage from "./pages/competition-list-page.tsx";
import VotePage from "./pages/vote-page.tsx";
import AdminPendingVotes from "./pages/pending-votes-page.tsx";

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
            path="/pending/:competitionId"
            element={<AdminPendingVotes />}
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
                <AddMultiForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-match/:matchId"
            element={
              <ProtectedRoute>
                <AddMultiForm />
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
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
