import GoogleButton from "react-google-button";
import { useAuth } from "../context/auth-context";

export default function LoginPage() {
  console.log("LoginPage: Component initialized");
  const { login, isLoading } = useAuth();
  console.log("LoginPage: Auth state loaded", { isLoading });

  if (isLoading) {
    console.log("LoginPage: Showing loading state");
    return <div>Loading...</div>;
  }

  const handleLogin = () => {
    console.log("LoginPage: Login button clicked");
    login();
  };

  console.log("LoginPage: Rendering login page");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <h1 className="text-center font-oswald text-3xl font-semibold">
        SUNDAY HEROES
      </h1>
      <GoogleButton type="light" onClick={handleLogin} />
    </div>
  );
}
