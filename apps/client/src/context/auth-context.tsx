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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const login = () => {
    const googleAuthUrl = `${config.google.authEndpoint}?client_id=${config.google.clientId}&redirect_uri=${config.redirect_uri}&response_type=code&scope=email profile`;
    window.location.href = googleAuthUrl;
  };

  const logout = () => {
    axiosInstance
      .get(`${config.server}/auth/logout`, { withCredentials: true })
      .then(() => setIsLoggedIn(false))
      .catch((error) => {
        console.error("There was an error logging out", error);
      });
  };

  const updateLoginState = async () => {
    try {
      console.log("Entered updateLoginState");
      setIsLoading(true);
      const response = await axiosInstance.get(`${config.server}/auth/verify`, {
        withCredentials: true,
      });

      console.log(response.data.loggedIn);

      setIsLoggedIn(response.data.loggedIn);
      setIsLoading(false);

      if (response.data.loggedIn) {
        navigate("/home");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      setIsLoggedIn(false);
      setIsLoading(false);
      navigate("/login");
    }
  };

  useEffect(() => {
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
