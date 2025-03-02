import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import { config } from "../config/config";
import { useAuth } from "../context/auth-context";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { updateLoginState } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        try {
          await axiosInstance.get(
            `${config.server}/auth/google/callback?code=${code}`,
          );

          await updateLoginState();
          navigate("/");
        } catch (error) {
          console.log(error);
          navigate("/");
        }
      }
    };

    handleCallback();
  }, [navigate, updateLoginState]);

  return <div>Logging you in...</div>;
}
