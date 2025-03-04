import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home-page";
import LoginPage from "./pages/login";
import ErrorPage from "./pages/error-page";
import ProtectedRoute from "./pages/protected-route";
import AddMultiForm from "./pages/add-multi-form";
import { AuthProvider } from "./context/auth-context.tsx";
import AuthCallback from "./pages/auth-callback.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
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
