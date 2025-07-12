import { useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/auth-context";
import { useErrorBoundary } from "react-error-boundary";

interface ErrorHandlerOptions {
  showToast?: boolean;
  redirectOnAuth?: boolean;
  logError?: boolean;
  throwError?: boolean; // Whether to throw to error boundary
}

export const useErrorHandler = () => {
  const { logout } = useAuth();
  const { showBoundary } = useErrorBoundary();

  const handleError = useCallback(
    (error: any, options: ErrorHandlerOptions = {}) => {
      const {
        showToast = true,
        redirectOnAuth = true,
        logError = true,
        throwError = false,
      } = options;

      if (logError) {
        console.error("Error occurred:", error);
      }

      // Handle different error types based on backend structure
      if (error.name === "ValidationError" && error.fields) {
        const messages = error.fields.map(
          (field: any) => `${field.field}: ${field.message}`,
        );
        if (showToast) {
          toast.error(`Validation Error: ${messages.join(", ")}`);
        }
        if (throwError) showBoundary(error);
        return;
      }

      if (error.name === "AuthenticationError" || error.statusCode === 401) {
        if (showToast) {
          toast.error("Authentication required. Please log in again.");
        }
        if (redirectOnAuth) {
          logout();
        }
        if (throwError) showBoundary(error);
        return;
      }

      if (error.name === "AuthorizationError" || error.statusCode === 403) {
        if (showToast) {
          toast.error("You are not authorized to perform this action.");
        }
        if (throwError) showBoundary(error);
        return;
      }

      if (error.name === "NotFoundError" || error.statusCode === 404) {
        if (showToast) {
          toast.error(`${error.resource || "Resource"} not found.`);
        }
        if (throwError) showBoundary(error);
        return;
      }

      if (error.name === "ConflictError" || error.statusCode === 409) {
        if (showToast) {
          toast.error(
            error.message || "A conflict occurred with existing data.",
          );
        }
        if (throwError) showBoundary(error);
        return;
      }

      if (error.name === "NetworkError") {
        if (showToast) {
          toast.error("Network error. Please check your connection.");
        }
        if (throwError) showBoundary(error);
        return;
      }

      // Generic error handling
      if (showToast) {
        toast.error(error.message || "An unexpected error occurred.");
      }

      if (throwError) {
        showBoundary(error);
      }
    },
    [logout, showBoundary],
  );

  return { handleError };
};
