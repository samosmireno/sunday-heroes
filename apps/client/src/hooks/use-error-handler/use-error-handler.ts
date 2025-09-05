import { useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/auth-context";
import { useErrorBoundary } from "react-error-boundary";
import { AppError } from "./types";

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
    (error: AppError, options: ErrorHandlerOptions = {}) => {
      const {
        showToast = true,
        redirectOnAuth = true,
        logError = true,
        throwError = false,
      } = options;

      if (logError) {
        console.error("Error occurred:", error);
      }

      if (error.name === "ValidationError" && error.fields) {
        const messages =
          error.response?.data?.fields?.map(
            (field) => `${field.field}: ${field.message}`,
          ) ?? [];
        if (showToast) {
          toast.error(`Validation Error: ${messages.join(", ")}`);
        }
        if (throwError) showBoundary(error);
        return;
      }

      if (error.name === "AuthenticationError" || error.status === 401) {
        if (showToast) {
          toast.error("Authentication required. Please log in again.");
        }
        if (redirectOnAuth) {
          logout();
        }
        if (throwError) showBoundary(error);
        return;
      }

      if (error.name === "AuthorizationError" || error.status === 403) {
        if (showToast) {
          toast.error("You are not authorized to perform this action.");
        }
        if (throwError) showBoundary(error);
        return;
      }

      if (error.name === "NotFoundError" || error.status === 404) {
        if (showToast) {
          toast.error(
            `${error.response?.data?.resource || "Resource"} not found.`,
          );
        }
        if (throwError) showBoundary(error);
        return;
      }

      if (error.name === "ConflictError" || error.statusCode === 409) {
        if (showToast) {
          toast.error(
            error.response?.data?.message ||
              "A conflict occurred with existing data.",
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
