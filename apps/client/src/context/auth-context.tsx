import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axiosInstance from "../config/axiosConfig";
import { config } from "../config/config";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  login: () => void;
  logout: () => void;
  updateLoginState: () => Promise<boolean>;
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
      const response = await axiosInstance.get(`${config.server}/auth/verify`, {
        withCredentials: true,
      });

      if (response.data.loggedIn) {
        setIsLoggedIn(true);
        return true;
      }
      setIsLoggedIn(false);
      return false;
    } catch (error) {
      console.log(error);
      setIsLoggedIn(false);
      return false;
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      await updateLoginState();
    };

    verifyToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, login, logout, updateLoginState }}
    >
      {children}
    </AuthContext.Provider>
  );
};
