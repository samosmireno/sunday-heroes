import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useEffect } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();

  console.log("[ProtectedRoute] Initialized with:", { isLoggedIn, isLoading });

  useEffect(() => {
    console.log("[ProtectedRoute] Effect running with:", {
      isLoggedIn,
      isLoading,
    });

    if (!isLoading && !isLoggedIn) {
      console.log(
        "[ProtectedRoute] User not authenticated, redirecting to login",
      );
      navigate("/login");
    } else if (!isLoading && isLoggedIn) {
      console.log("[ProtectedRoute] User authenticated, allowing access");
    }
  }, [isLoggedIn, isLoading, navigate]);

  if (isLoading) {
    console.log("[ProtectedRoute] Still loading, showing loading state");
    return <div>Loading...</div>;
  }

  console.log(
    "[ProtectedRoute] Rendering:",
    isLoggedIn ? "authorized content" : "null",
  );
  return isLoggedIn ? children : null;
};

export default ProtectedRoute;
