import { useAuth } from "../context/auth-context";
import Background from "../components/ui/background";
import Loading from "../components/ui/loading";
import { useLocation } from "react-router-dom";
import LandingHeader from "../features/landing/landing-header";
import HeroSection from "../features/landing/hero-section";
import FeaturesSection from "../features/landing/features-section";
import HowItWorksSection from "../features/landing/how-it-works-section";
import FinalCtaSection from "../features/landing/final-cta-section";
import LandingFooter from "../features/landing/landing-footer";
import { constructFullPath } from "@/features/landing/utils";

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
