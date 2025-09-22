export default function LandingFooter() {
  return (
    <footer className="border-t border-accent/20 px-6 py-8 text-center">
      <div className="flex items-center justify-center space-x-3">
        <img
          src="/assets/logo.webp"
          alt="Sunday Heroes Logo"
          className="h-12 w-12 object-contain"
        />
        <span className="text-gray-400">
          © 2025 Sunday Heroes. Made for football lovers.
        </span>
      </div>
    </footer>
  );
}
