import { useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useErrorBoundary } from "react-error-boundary";
import { isSessionExpired } from "@/config/axios-config";
import { AppError } from "./types";

/**
 * The status the server answered with. An AxiosError carries it in more than
 * one place depending on how far the request got, and our own error payload
 * carries it a fourth time as `code`; reading only one of them is how a branch
 * ends up dead. The 409 branch below tested `error.statusCode`, which an
 * AxiosError does not have, so the server's own words for a conflict never
 * reached anyone.
 */
export const httpStatus = (error: AppError): number | undefined =>
  error.status ??
  error.statusCode ??
  error.response?.status ??
  error.response?.data?.code;

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

      const status = httpStatus(error);
      const serverMessage = error.response?.data?.message;

      // The session died and could not be renewed. It arrives as its own error
      // rather than as a 401 because the refresh has already been tried and
      // failed; there is nothing left to do but sign the player out.
      if (isSessionExpired(error) || error.name === "SessionExpiredError") {
        if (showToast) {
          toast.error("Your session has expired. Please sign in again.");
        }
        if (redirectOnAuth) {
          logout();
        }
        if (throwError) showBoundary(error);
        return;
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

      if (error.name === "AuthenticationError" || status === 401) {
        if (showToast) {
          toast.error("Authentication required. Please log in again.");
        }
        if (redirectOnAuth) {
          logout();
        }
        if (throwError) showBoundary(error);
        return;
      }

      if (error.name === "AuthorizationError" || status === 403) {
        if (showToast) {
          toast.error("You are not authorized to perform this action.");
        }
        if (throwError) showBoundary(error);
        return;
      }

      if (error.name === "NotFoundError" || status === 404) {
        if (showToast) {
          toast.error(
            `${error.response?.data?.resource || "Resource"} not found.`,
          );
        }
        if (throwError) showBoundary(error);
        return;
      }

      if (error.name === "ConflictError" || status === 409) {
        if (showToast) {
          toast.error(
            serverMessage || "A conflict occurred with existing data.",
          );
        }
        if (throwError) showBoundary(error);
        return;
      }

      // A 400 is the server refusing this particular request, and it always
      // says why: "Voting is not open for this match", "You must vote for
      // exactly 3 players", "You have already submitted votes for this match".
      // Without this the player got `Request failed with status code 400` and
      // no idea which of nine rules they had run into.
      if (status === 400 && serverMessage) {
        if (showToast) {
          toast.error(serverMessage);
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
