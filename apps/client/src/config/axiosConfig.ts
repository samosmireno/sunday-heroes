import axios, { AxiosError } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { config } from "./config";

const axiosInstance = axios.create({
  baseURL: config.server,
  withCredentials: true,
});

let isRefreshing = false;
let authUpdateCallback: ((isLoggedIn: boolean) => void) | null = null;

export const setAuthUpdateCallback = (
  callback: (isLoggedIn: boolean) => void,
) => {
  authUpdateCallback = callback;
};

const refreshAuthLogic = async (failedRequest: any) => {
  try {
    if (isRefreshing) {
      return Promise.reject(failedRequest);
    }

    isRefreshing = true;
    await axiosInstance.get("/auth/refresh");
    isRefreshing = false;

    if (authUpdateCallback) {
      authUpdateCallback(true);
    }

    return Promise.resolve();
  } catch (error) {
    isRefreshing = false;
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
