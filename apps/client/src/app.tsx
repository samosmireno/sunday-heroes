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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/competition/:competitionId"
            element={
              <ProtectedRoute>
                <CompetitionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-competition"
            element={
              <ProtectedRoute>
                <CreateCompetitionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-match"
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

          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
