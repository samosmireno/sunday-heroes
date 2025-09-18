import { useAuth } from "../context/auth-context";
import Background from "../components/ui/background";
import Loading from "../components/ui/loading";
import { useLocation } from "react-router-dom";
import LandingHeader from "../components/landing/landing-header";
import HeroSection from "../components/landing/hero-section";
import FeaturesSection from "../components/landing/features-section";
import HowItWorksSection from "../components/landing/how-it-works-section";
import FinalCtaSection from "../components/landing/final-cta-section";
import LandingFooter from "../components/landing/landing-footer";

const constructFullPath = (location?: Location | null) => {
  if (!location) return "/dashboard";

  let fullPath = location.pathname || "/dashboard";

  if (location.search) {
    fullPath += location.search;
  }

  if (location.hash) {
    fullPath += location.hash;
  }

  return fullPath;
};

export default function LandingPage() {
  const { login, isLoading } = useAuth();
  const location = useLocation();

  const from = constructFullPath(location.state?.from);

  const handleLogin = () => {
    login(from);
  };

  if (isLoading) {
    return <Loading text="Loading page..." />;
  }

  return (
    <div className="relative min-h-screen bg-secondary">
      <Background />
      <div className="relative">
        <LandingHeader onLogin={handleLogin} />
        <HeroSection onLogin={handleLogin} />
        <FeaturesSection />
        <HowItWorksSection />
        {/* <SocialProofSection /> */}
        <FinalCtaSection onLogin={handleLogin} />
        <LandingFooter />
      </div>
    </div>
  );
}
