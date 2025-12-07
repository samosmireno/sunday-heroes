import { Trophy } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import Background from "@/components/ui/background";
import Loading from "@/components/ui/loading";
import { Link, Navigate, useLocation } from "react-router-dom";
import { constructFullPath } from "@/features/landing/utils";
import LoginForm from "@/features/sign-in-form/login-form";
import { Toaster } from "sonner";

export default function LoginPage() {
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
      <Toaster
        position="top-right"
        closeButton
        duration={4000}
        theme="dark"
        toastOptions={{
          classNames: {
            toast:
              "group toast font-retro group-[.toaster]:bg-panel-bg group-[.toaster]:text-gray-200 group-[.toaster]:border-2 group-[.toaster]:border-tellow-500/40 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:p-4 group-[.toaster]:backdrop-blur-sm",
            description: "group-[.toast]:text-gray-300 group-[.toast]:text-sm",
            cancelButton:
              "group-[.toast]:bg-bg/30 group-[.toast]:text-gray-300 group-[.toast]:hover:bg-bg/50 group-[.toast]:border-accent/30 group-[.toast]:rounded group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm",
            closeButton:
              "group-[.toast]:bg-red-500/20 group-[.toast]:text-red-400 group-[.toast]:border-red-500/30 group-[.toast]:hover:bg-red-500/30 group-[.toast]:rounded group-[.toast]:p-1",
            error:
              "group-[.toaster]:bg-panel-bg group-[.toaster]:border-red-500/60 group-[.toaster]:text-red-200",
          },
        }}
      />
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
                Sign in to manage your football competitions
              </p>
            </div>

            <LoginForm />

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-400">Don’t have an account?</span>{" "}
              <Link
                to="/register"
                className="rounded font-semibold text-accent underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                Sign up here
              </Link>
            </div>

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
                  <span>Sign in with Google</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
