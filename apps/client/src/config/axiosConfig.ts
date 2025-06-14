import axios, { AxiosError } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { config } from "./config";

const axiosInstance = axios.create({
  baseURL: config.server,
  withCredentials: true,
});

//let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

const refreshAuthLogic = async (failedRequest: AxiosError) => {
  try {
    // if (isRefreshing) {
    //   return Promise.reject(failedRequest);
    // }
    if (refreshPromise) {
      return refreshPromise;
    }

    //isRefreshing = true;
    //const currentPath = window.location.pathname + window.location.search;

    refreshPromise = axiosInstance.get("/auth/refresh");

    //isRefreshing = false;
    //todo
    //window.location.reload();
    await refreshPromise;
    return Promise.resolve();
  } catch (error) {
    //isRefreshing = false;
    refreshPromise = null;
    localStorage.removeItem("user");
    window.location.href = "/login";
    return Promise.reject(error);
  }
};

createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic, {
  shouldRefresh: (error: AxiosError) => {
    return error.response?.status === 401;
  },
});

export default axiosInstance;
