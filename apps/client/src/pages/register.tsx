import { Trophy } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import Background from "@/components/ui/background";
import Loading from "@/components/ui/loading";
import { Navigate, useLocation } from "react-router-dom";
import { constructFullPath } from "@/features/landing/utils";
import RegisterForm from "@/features/register-form/register-form";

export default function RegisterPage() {
  const { user, login, isLoading } = useAuth();
  const location = useLocation();

  const from = constructFullPath(location.state?.from);

  const handleLogin = () => {
    login(from);
  };

  if (isLoading) {
    return <Loading text="Loading page..." />;
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="relative flex min-h-screen flex-col bg-secondary">
      <Background />
      <div className="relative flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="">
            <div className="mb-6 flex flex-col items-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20">
                <Trophy className="h-12 w-12 text-accent" />
              </div>
              <h1
                className="text-center font-oswald text-3xl font-bold uppercase tracking-wider text-accent"
                style={{ textShadow: "2px 2px 0 #000" }}
              >
                Sunday Heroes
              </h1>
              <p className="mt-2 text-center text-sm text-gray-400">
                Register to manage your football competitions
              </p>
            </div>

            <RegisterForm />

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLogin}
                className="w-full transform rounded-lg border-2 border-accent bg-accent/20 px-4 py-3 font-bold text-accent shadow-md transition-transform duration-200 hover:translate-y-1 hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-bg"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"
                    />
                  </svg>
                  <span>Sign Up with Google</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
