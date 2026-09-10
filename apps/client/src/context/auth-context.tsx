import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axiosInstance from "../config/axios-config";
import { config } from "../config/config";
import { useNavigate } from "react-router-dom";
import { UserResponse } from "@repo/shared-types";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  isLoading: boolean;
  login: (arg1?: string) => void;
  logout: () => void;
  user: UserResponse | undefined;
  isAuthenticated: boolean;
  processAuthSuccess: (arg0: string) => UserResponse;
  setUserData: (user: UserResponse) => void;
  error: string;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserResponse>();
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const login = (redirectPath?: string) => {
    if (redirectPath && redirectPath !== "/dashboard") {
      sessionStorage.setItem("redirectAfterLogin", redirectPath);
    }

    const googleAuthUrl = `${config.google.authEndpoint}?client_id=${config.google.clientId}&redirect_uri=${config.redirect_uri}&response_type=code&scope=email profile`;
    window.location.href = googleAuthUrl;
  };

  const logout = () => {
    axiosInstance
      .get(`${config.server}/auth/logout`, { withCredentials: true })
      .catch((error) => {
        // Clearing the cookies is the server's half and it can fail; the
        // client's half must happen either way. Leaving a signed-out player
        // looking at a signed-in app is how a dead session goes unnoticed
        // until the one request that needed it.
        console.error("Logout error:", error);
      })
      .finally(() => {
        queryClient.clear();
        setUser(undefined);
        localStorage.removeItem("user");
        navigate("/landing");
      });
  };

  const setUserData = (userData: UserResponse) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const processAuthSuccess = (userDataBase64: string) => {
    try {
      if (!userDataBase64) {
        throw new Error("No user data received");
      }

      const binary = Uint8Array.from(atob(userDataBase64), (c) =>
        c.charCodeAt(0),
      );
      const jsonStr = new TextDecoder("utf-8").decode(binary);
      const userData = JSON.parse(jsonStr);

      setUserData(userData);

      return userData;
    } catch (err) {
      console.error("Error processing auth success:", err);
      setError("Authentication success processing failed");
      return null;
    }
  };

  /**
   * A stored user is a claim, not a session.
   *
   * `localStorage.user` used to be the whole of `isAuthenticated`. It is
   * permanent storage, and the thing it stands for — the refresh cookie — is
   * not: browsers evict cookies on their own schedule, and a player whose
   * cookies were gone still got the full signed-in app, protected routes and
   * all. Almost every read in this app hits an unauthenticated endpoint, so
   * nothing gave the lie away. On the vote page the first authenticated
   * request a player ever makes is the vote itself, which meant the discovery
   * came at the one moment it cost something.
   *
   * So the claim is checked against the server before it counts. The refresh
   * interceptor gets its one attempt inside this request; if that fails the
   * claim is thrown away, and `isAuthenticated` is false for a session the
   * server would in fact refuse.
   */
  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      try {
        if (!localStorage.getItem("user")) return;

        const { data } = await axiosInstance.get<UserResponse>(
          `${config.server}/auth/me`,
        );

        if (cancelled) return;
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } catch (err) {
        console.error("Error initializing auth:", err);
        localStorage.removeItem("user");
        if (!cancelled) setUser(undefined);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    verifySession();

    return () => {
      cancelled = true;
    };
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
        setUserData,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
