import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axiosInstance, {
  setAuthUpdateCallback,
  setLoadingStateCallback,
} from "../config/axiosConfig";
import { config } from "../config/config";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isLoading: boolean;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  login: () => void;
  logout: () => void;
  updateLoginState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("useAuth called outside of AuthProvider");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Registering auth update and loading state callbacks");
    setAuthUpdateCallback((loggedIn) => {
      console.log(`Auth update callback triggered: isLoggedIn = ${loggedIn}`);
      setIsLoggedIn(isLoggedIn);
    });

    setLoadingStateCallback((loading) => {
      console.log(`Loading state callback triggered: isLoading = ${loading}`);
      setIsLoading(isLoading);
    });

    return () => {
      setAuthUpdateCallback(() => {});
      setLoadingStateCallback(() => {});
    };
  }, []);

  const login = () => {
    console.log("Login initiated - Redirecting to Google Auth");
    const googleAuthUrl = `${config.google.authEndpoint}?client_id=${config.google.clientId}&redirect_uri=${config.redirect_uri}&response_type=code&scope=email profile`;
    window.location.href = googleAuthUrl;
  };

  const logout = () => {
    console.log("Logout initiated");
    axiosInstance
      .get(`${config.server}/auth/logout`, { withCredentials: true })
      .then(() => {
        console.log("Logout successful");
        setIsLoggedIn(false);
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  const updateLoginState = async () => {
    try {
      console.log("Checking authentication status...");
      setIsLoading(true);
      const response = await axiosInstance.get(`${config.server}/auth/verify`, {
        withCredentials: true,
      });

      console.log("Auth verification response:", response.data);

      setIsLoggedIn(response.data.loggedIn);
      setIsLoading(false);

      if (response.data.loggedIn) {
        console.log("User is authenticated, navigating to home");
        //navigate("/home");
      } else {
        console.log("User is not authenticated, navigating to login");
        navigate("/login");
      }
    } catch (error) {
      console.error("Authentication verification failed:", error);
      setIsLoggedIn(false);
      setIsLoading(false);
      console.log("Redirecting to login after auth error");
      navigate("/login");
    }
  };

  useEffect(() => {
    console.log("AuthProvider mounted, initializing auth state");
    updateLoginState();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isLoggedIn,
        setIsLoggedIn,
        login,
        logout,
        updateLoginState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
