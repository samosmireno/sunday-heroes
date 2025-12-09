import { GoogleIcon } from "@/components/icons/google";
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
              <GoogleIcon />
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
