import axios, { AxiosResponse } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { config } from "./config";

const axiosInstance = axios.create({
  baseURL: config.server,
  withCredentials: true,
});

/**
 * The session is gone and could not be renewed: the access cookie was missing
 * or refused, and the refresh cookie could not buy a new one. Every request
 * through this instance rejects with one of these once that has happened, so a
 * caller can tell "you are no longer signed in" apart from "the server said
 * no", and answer it with something better than a generic failure.
 */
export class SessionExpiredError extends Error {
  readonly name = "SessionExpiredError";

  /** Where the player was when it happened, so signing in can put them back. */
  readonly returnPath: string;

  constructor(returnPath: string) {
    super("Your session has expired");
    this.returnPath = returnPath;
  }
}

export const isSessionExpired = (
  error: unknown,
): error is SessionExpiredError => error instanceof SessionExpiredError;

let refreshPromise: Promise<AxiosResponse> | null = null;

const refreshAuthLogic = async () => {
  try {
    if (refreshPromise) {
      await refreshPromise;
      return Promise.resolve();
    }

    refreshPromise = axiosInstance.get("/auth/refresh");
    await refreshPromise;
    refreshPromise = null;

    return Promise.resolve();
  } catch {
    refreshPromise = null;

    const returnPath = window.location.pathname + window.location.search;
    localStorage.removeItem("user");
    sessionStorage.setItem("redirectAfterLogin", returnPath);

    /**
     * No `window.location.href = "/landing"` here, which is what this used to
     * do. A full-page navigation out of a failed request throws away whatever
     * the player was in the middle of — three names picked on a ballot, most
     * expensively — and lands them on a page that says nothing about what
     * became of it. That is how votes were being lost silently: submit, a
     * blank landing page, and a player who believed they had voted.
     *
     * Rejecting instead leaves the decision with the caller. Most hand it to
     * `useErrorHandler`, which signs the player out and routes them to the
     * landing page exactly as before; the vote page keeps the ballot on
     * screen and says plainly that nothing was submitted.
     */
    throw new SessionExpiredError(returnPath);
  }
};

createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic, {
  statusCodes: [401],
  pauseInstanceWhileRefreshing: true,
});

export default axiosInstance;
