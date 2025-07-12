import { ErrorBoundary } from "react-error-boundary";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { ReactNode } from "react";
import Background from "../../ui/background";
import { Button } from "../../ui/button";

interface PageErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  pageName?: string;
  showBackButton?: boolean;
}

function PageErrorFallback({
  resetErrorBoundary,
  pageName,
  showBackButton = true,
}: PageErrorFallbackProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-secondary p-6">
      <Background />
      <div className="relative z-10 w-full max-w-md rounded-lg border-2 border-red-500/70 bg-panel-bg p-6 shadow-lg">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h2
            className="mb-3 text-center font-oswald text-2xl font-bold uppercase tracking-wider text-red-500"
            style={{ textShadow: "2px 2px 0 #000" }}
          >
            Page Error
          </h2>
          <p className="text-center text-gray-300">
            {pageName ? `The ${pageName} page` : "This page"} encountered an
            error and couldn't load properly.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            onClick={resetErrorBoundary}
            className="rounded-lg border-2 border-accent bg-accent/20 px-4 py-3 font-bold text-accent shadow-md transition-transform duration-200 hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-panel-bg"
          >
            Try Again
          </Button>

          {showBackButton && (
            <Button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-accent bg-accent/20 px-4 py-3 font-bold text-accent shadow-md transition-transform duration-200 hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-panel-bg"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
  showBackButton?: boolean;
}

export function PageErrorBoundary({
  children,
  pageName,
  showBackButton,
}: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={(props) => (
        <PageErrorFallback
          {...props}
          pageName={pageName}
          showBackButton={showBackButton}
        />
      )}
      onError={(error, errorInfo) => {
        console.error(
          `Page Error Boundary (${pageName || "Unknown"}) caught an error:`,
          error,
          errorInfo,
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
