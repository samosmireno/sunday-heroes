import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Background from "@/components/ui/background";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { formatErrorStack } from "./utils";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Background />
      <div className="z-10 flex max-w-lg flex-col items-center rounded-lg border-2 border-red-500 bg-panel-bg p-6 shadow-lg">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>

        <h1 className="mb-3 text-2xl font-bold text-red-500">
          Something went wrong
        </h1>

        <p className="mb-6 text-center text-gray-300">
          An unexpected error occurred. Please try refreshing the page or return
          to the dashboard.
        </p>

        <div className="flex gap-4">
          <Button
            onClick={resetErrorBoundary}
            className="flex items-center gap-2 rounded-lg border-2 border-accent bg-accent/20 px-4 py-2 text-accent hover:bg-accent/30"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          <Button
            onClick={() => (window.location.href = "/dashboard")}
            className="flex items-center gap-2 rounded-lg border-2 border-accent bg-accent/20 px-4 py-2 text-accent hover:bg-accent/30"
          >
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 w-full">
            <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
              Error Details (Development)
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-800 p-2 text-xs text-gray-300">
              {formatErrorStack(error.stack)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error(
          "Global Error Boundary caught an error:",
          error,
          errorInfo,
        );
      }}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
