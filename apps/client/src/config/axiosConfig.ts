import axios, { AxiosError } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { config } from "./config";

const axiosInstance = axios.create({
  baseURL: config.server,
  withCredentials: true,
});

let isRefreshing = false;
let authUpdateCallback: ((isLoggedIn: boolean) => void) | null = null;
let loadingStateCallback: ((isLoading: boolean) => void) | null = null;

export const setAuthUpdateCallback = (
  callback: (isLoggedIn: boolean) => void,
) => {
  authUpdateCallback = callback;
};

export const setLoadingStateCallback = (
  callback: (isLoading: boolean) => void,
) => {
  loadingStateCallback = callback;
};

const refreshAuthLogic = async (failedRequest: AxiosError) => {
  try {
    if (isRefreshing) {
      return Promise.reject(failedRequest);
    }

    isRefreshing = true;
    if (loadingStateCallback) {
      console.log("Setting loading state to true for token refresh");
      loadingStateCallback(true);
    }

    console.log("Attempting to refresh auth token...");

    await axiosInstance.get("/auth/refresh");
    console.log("Auth token refresh successful");

    isRefreshing = false;

    if (loadingStateCallback) {
      console.log("Setting loading state to false after token refresh");
      loadingStateCallback(false);
    }

    if (authUpdateCallback) {
      authUpdateCallback(true);
    }

    return Promise.resolve();
  } catch (error) {
    isRefreshing = false;

    if (loadingStateCallback) {
      console.log("Setting loading state to false after token refresh failure");
      loadingStateCallback(false);
    }

    if (authUpdateCallback) {
      authUpdateCallback(false);
    }
    return Promise.reject(error);
  }
};

createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic, {
  shouldRefresh: (error: AxiosError) => {
    return error.response?.status === 401 && !isRefreshing;
  },
});

export default axiosInstance;
