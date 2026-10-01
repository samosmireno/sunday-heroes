import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import Loading from "@/components/ui/loading";
import { toast } from "sonner";
import { READ_ONLY_CODE, READ_ONLY_MESSAGE } from "@repo/shared-types";

const AuthCallback = () => {
  const { processAuthSuccess } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const userParam = searchParams.get("user");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      console.error("Authentication error:", errorParam);
      // A Google account with no User here: the frozen copy signs no one up.
      if (errorParam === READ_ONLY_CODE)
        toast.error(READ_ONLY_MESSAGE, { id: READ_ONLY_CODE });
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
