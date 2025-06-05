import axios, { AxiosError } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { config } from "./config";

const axiosInstance = axios.create({
  baseURL: config.server,
  withCredentials: true,
});

let isRefreshing = false;

const refreshAuthLogic = async (failedRequest: AxiosError) => {
  try {
    if (isRefreshing) {
      return Promise.reject(failedRequest);
    }

    isRefreshing = true;
    //const currentPath = window.location.pathname + window.location.search;

    await axiosInstance.get("/auth/refresh");

    isRefreshing = false;
    //todo
    //window.location.reload();
    return Promise.resolve();
  } catch (error) {
    isRefreshing = false;
    localStorage.removeItem("user");
    window.location.href = "/login";
    return Promise.reject(error);
  }
};

createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic, {
  shouldRefresh: (error: AxiosError) => {
    return error.response?.status === 401 && !isRefreshing;
  },
});

export default axiosInstance;
