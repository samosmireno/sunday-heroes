import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/auth-context";

const AuthCallback = () => {
  const { processAuthSuccess } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const userParam = searchParams.get("user");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      console.error("Authentication error:", errorParam);
      navigate("/login", { replace: true });
      return;
    }

    if (userParam) {
      const userData = processAuthSuccess(userParam);
      if (userData) {
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          navigate(redirectPath, { replace: true });
          setTimeout(() => {
            sessionStorage.removeItem("redirectAfterLogin");
          }, 100);
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        navigate("/login", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate, processAuthSuccess, searchParams]);

  return <div>Completing authentication...</div>;
};

export default AuthCallback;
