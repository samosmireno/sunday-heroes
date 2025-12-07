import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  onGoogleLogin: () => void;
}

export default function HeroSection({ onGoogleLogin }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="px-6 py-12 text-center sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h1
          className="mb-6 font-oswald text-4xl font-bold uppercase leading-tight tracking-wider text-accent sm:text-6xl"
          style={{ textShadow: "2px 2px 0 #000" }}
        >
          Turn Your Weekend Football Into Epic Competitions
        </h1>
        <p className="mb-8 text-lg text-gray-300 sm:text-xl">
          Create leagues, track matches, and compete with friends in a social
          football platform.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => navigate("/register")}
            className="w-full transform rounded-lg border-2 border-accent bg-accent/20 px-8 py-4 font-bold text-accent shadow-lg transition-transform duration-200 hover:translate-y-1 hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-bg sm:w-auto"
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-lg">Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </div>
          </button>
          <button
            onClick={onGoogleLogin}
            className="w-full transform rounded-lg border-2 border-gray-500 bg-gray-500/20 px-8 py-4 font-bold text-gray-300 shadow-lg transition-transform duration-200 hover:translate-y-1 hover:bg-gray-500/30 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2 focus:ring-offset-bg sm:w-auto"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"
                />
              </svg>
              <span className="text-lg">Sign in with Google</span>
            </div>
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-semibold text-accent hover:underline"
          >
            Login here
          </button>
        </p>
      </div>
    </section>
  );
}
