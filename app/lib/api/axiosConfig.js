import axios from "axios";
import Cookies from "js-cookie";

export const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = Cookies.get("token");

      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (config.retryCount === undefined) {
        config.retryCount = 0;
        config.maxRetries = 3;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      const shouldNotRetry =
        originalRequest.retryCount >= originalRequest.maxRetries ||
        originalRequest._retry;

      const isClientError =
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500;
      const isNetworkError = !error.response;

      if (error.response && error.response.status === 429) {
        console.warn("Rate limited! Too many requests.");
        error.isRateLimited = true;

        return Promise.reject(error);
      }

      if (error.response && error.response.status === 401) {
        console.error("Authentication error");

        return Promise.reject(error);
      }

      if (
        !shouldNotRetry &&
        (isNetworkError || (error.response && error.response.status >= 500))
      ) {
        originalRequest._retry = true;
        originalRequest.retryCount += 1;

        const delay = Math.pow(2, originalRequest.retryCount) * 1000;
        console.log(
          `Retrying request (${originalRequest.retryCount}/${originalRequest.maxRetries}) after ${delay}ms`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return axios(originalRequest);
      }

      return Promise.reject(error);
    }
  );
};
