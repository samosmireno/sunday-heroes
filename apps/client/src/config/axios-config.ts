import axios, { AxiosResponse } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { config } from "./config";

const axiosInstance = axios.create({
  baseURL: config.server,
  withCredentials: true,
});

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
  } catch (error) {
    refreshPromise = null;
    localStorage.removeItem("user");
    window.location.href = "/landing";
    return Promise.reject(error);
  }
};

createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic, {
  statusCodes: [401],
  pauseInstanceWhileRefreshing: true,
});

export default axiosInstance;
