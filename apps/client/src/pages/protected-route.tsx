import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { AppLayout } from "./app-layout";
import Loading from "../components/ui/loading";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading text="Loading page..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

export default ProtectedRoute;
