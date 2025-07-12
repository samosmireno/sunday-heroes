import { ErrorBoundary } from "react-error-boundary";
import { AlertCircle, RefreshCw, Wifi } from "lucide-react";
import { AxiosError } from "axios";
import { ReactNode } from "react";

interface ApiErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ApiErrorFallback({
  error,
  resetErrorBoundary,
}: ApiErrorFallbackProps) {
  const axiosError = error as AxiosError;

  const isNetworkError =
    !axiosError.response && axiosError.code === "NETWORK_ERROR";
  const isAuthError =
    axiosError.response?.status === 401 || axiosError.response?.status === 403;

  if (isAuthError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
        <h3 className="mb-2 text-lg font-semibold text-red-500">
          Authentication Required
        </h3>
        <p className="mb-4 text-gray-400">Please log in to continue</p>
      </div>
    );
  }

  if (isNetworkError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Wifi className="mb-4 h-16 w-16 text-orange-500" />
        <h3 className="mb-2 text-lg font-semibold text-orange-500">
          Connection Error
        </h3>
        <p className="mb-4 text-gray-400">
          Please check your internet connection
        </p>
        <button
          onClick={resetErrorBoundary}
          className="flex items-center gap-2 rounded-lg border-2 border-accent bg-accent/20 px-4 py-2 text-accent hover:bg-accent/30"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
      <h3 className="mb-2 text-lg font-semibold text-red-500">
        Something went wrong
      </h3>
      <p className="mb-4 text-gray-400">An error occurred while loading data</p>
      <button
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 rounded-lg border-2 border-accent bg-accent/20 px-4 py-2 text-accent hover:bg-accent/30"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}

interface ApiErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  onAuthError?: () => void;
}

export function ApiErrorBoundary({
  children,
  onRetry,
  onAuthError,
}: ApiErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ApiErrorFallback}
      onError={(error, errorInfo) => {
        console.error("API Error Boundary caught an error:", error, errorInfo);

        const axiosError = error as AxiosError;
        if (
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 403
        ) {
          onAuthError?.();
        }
      }}
      onReset={() => {
        onRetry?.();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
