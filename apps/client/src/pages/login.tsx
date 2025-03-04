import GoogleButton from "react-google-button";
import { useAuth } from "../context/auth-context";

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <h1 className="text-center font-oswald text-3xl font-semibold">
        SUNDAY HEROES
      </h1>
      <GoogleButton type="light" onClick={login} />
    </div>
  );
}
