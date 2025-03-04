import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

const AuthCallback = () => {
  const { updateLoginState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await updateLoginState();
      } catch (error) {
        console.error("Authentication callback failed:", error);
        navigate("/login");
      }
    };

    handleCallback();
  }, [updateLoginState, navigate]);

  return <div>Completing authentication...</div>;
};

export default AuthCallback;
