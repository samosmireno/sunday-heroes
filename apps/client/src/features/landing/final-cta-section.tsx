import { ArrowRight } from "lucide-react";

interface FinalCtaSectionProps {
  onLogin: () => void;
}

export default function FinalCtaSection({ onLogin }: FinalCtaSectionProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2
          className="mb-6 font-oswald text-3xl font-bold uppercase tracking-wider text-accent sm:text-4xl"
          style={{ textShadow: "2px 2px 0 #000" }}
        >
          Ready to Start Your Competition?
        </h2>
        <p className="mb-8 text-lg text-gray-300">
          Join likeminded football enthusiasts managing their weekend
          competitions with Sunday Heroes.
        </p>
        <button
          onClick={onLogin}
          className="w-full transform rounded-lg border-2 border-accent bg-accent/20 px-8 py-4 font-bold text-accent shadow-lg transition-transform duration-200 hover:translate-y-1 hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-bg sm:w-auto"
        >
          <div className="flex items-center justify-center space-x-3">
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"
              />
            </svg>
            <span className="text-lg">Get Started Now</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </button>
      </div>
    </section>
  );
}
