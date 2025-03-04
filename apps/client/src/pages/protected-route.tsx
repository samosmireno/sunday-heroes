import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useEffect } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isLoggedIn ? children : null;
};

export default ProtectedRoute;
