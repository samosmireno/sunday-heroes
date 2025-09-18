import { Trophy } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-accent/20 px-6 py-8 text-center">
      <div className="flex items-center justify-center space-x-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
          <Trophy className="h-5 w-5 text-accent" />
        </div>
        <span className="text-gray-400">
          © 2025 Sunday Heroes. Made for football lovers.
        </span>
      </div>
    </footer>
  );
}
