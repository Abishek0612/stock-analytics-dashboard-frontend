import { useAuth } from "@/lib/auth/AuthProvider";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/lib/config";

const createAxiosInstance = () => {
  const instance = axios.create({
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(
    (config) => {
      if (typeof config.retryCount === "undefined") {
        config.retryCount = 0;
        config.maxRetries = 3;
      }

      const token = Cookies.get("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
};

export function useStockData(tickers, timeframe, customRange = null) {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const previousRequest = useRef(null);
  const axiosInstance = useRef(createAxiosInstance());

  const fetchStockData = useCallback(async () => {
    if (!tickers || tickers.length === 0) {
      setData({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (previousRequest.current && previousRequest.current.cancel) {
      previousRequest.current.cancel("Operation canceled due to new request.");
    }

    const cancelToken = axios.CancelToken.source();
    previousRequest.current = cancelToken;

    try {
      const token = Cookies.get("token");
      if (!token) {
        console.error("No authentication token found");
        setError("Authentication required. Please log in again.");
        setIsLoading(false);
        return;
      }

      const tickerSymbols = tickers.map((t) => t.value).join(",");
      let url = `${API_URL}/stocks/data?tickers=${tickerSymbols}&timeframe=${timeframe}`;

      if (timeframe === "custom" && customRange) {
        url += `&start=${customRange.start}&end=${customRange.end}`;
      }

      const { data: response } = await axiosInstance.current.get(url, {
        cancelToken: cancelToken.token,
      });

      if (response && response.status === "success") {
        setData(response.data);
      } else {
        setError("Failed to fetch stock data");
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Request canceled:", err.message);
        return;
      }

      console.error("Error fetching stock data:", err);

      if (err.response && err.response.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(err.message || "Failed to fetch stock data");
      }
    } finally {
      setIsLoading(false);
    }
  }, [tickers, timeframe, customRange, logout]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStockData();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (previousRequest.current && previousRequest.current.cancel) {
        previousRequest.current.cancel(
          "Operation canceled due to component unmount."
        );
      }
    };
  }, [fetchStockData]);

  const refetch = () => {
    fetchStockData();
  };

  return { data, isLoading, error, refetch };
}
