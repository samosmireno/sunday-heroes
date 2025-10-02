import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import Loading from "@/components/ui/loading";

const AuthCallback = () => {
  const { processAuthSuccess } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const userParam = searchParams.get("user");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      console.error("Authentication error:", errorParam);
      navigate("/landing", { replace: true });
      return;
    }

    if (userParam) {
      const userDataBase64 = decodeURIComponent(userParam);
      const userData = processAuthSuccess(userDataBase64);
      if (userData) {
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        const destination = redirectPath || "/dashboard";

        navigate(destination, { replace: true });

        if (redirectPath) {
          sessionStorage.removeItem("redirectAfterLogin");
        }
        return;
      }
    }

    navigate("/landing", { replace: true });
  }, [navigate, processAuthSuccess, searchParams]);

  return <Loading text="Completing authentication..." />;
};

export default AuthCallback;
