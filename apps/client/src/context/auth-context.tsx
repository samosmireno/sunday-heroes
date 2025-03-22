import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axiosInstance from "../config/axiosConfig";
import { config } from "../config/config";
import { useNavigate } from "react-router-dom";
import { UserResponse } from "@repo/logger";

interface AuthContextType {
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  user: UserResponse | undefined;
  isAuthenticated: boolean;
  processAuthSuccess: (arg0: string) => UserResponse;
  error: string;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserResponse>();
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
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
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
    localStorage.removeItem("user");
  };

  const processAuthSuccess = (userDataBase64: string) => {
    try {
      if (!userDataBase64) {
        throw new Error("No user data received");
      }

      const userData = JSON.parse(atob(userDataBase64));

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;
    } catch (err) {
      console.error("Error processing auth success:", err);
      setError("Authentication success processing failed");
      return null;
    }
  };

  useEffect(() => {
    console.log("AuthProvider mounted, initializing auth state");
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // try {
          //   const response = await axiosInstance.get(
          //     `${config.server}/auth/me`,
          //   );
          //   setUser(response.data);
          //   localStorage.setItem("user", JSON.stringify(response.data));
          // } catch (verifyError) {
          //   console.error("Stored user verification failed:", verifyError);
          //   localStorage.removeItem("user");
          //   setUser(undefined);
          // }
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        setError("Failed to initialize authentication");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        login,
        logout,
        user,
        isAuthenticated: !!user,
        processAuthSuccess,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
