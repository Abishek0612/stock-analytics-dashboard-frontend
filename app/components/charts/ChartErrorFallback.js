"use client";

import { useState, useEffect } from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

export default function ChartErrorFallback({ error, resetErrorBoundary }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!error) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          resetErrorBoundary();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [error, resetErrorBoundary]);

  return (
    <div className="w-full h-96 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <FiAlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
        Chart Loading Error
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-4">
        {error?.message || "There was an error loading the chart data."}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Trying again automatically in {countdown} seconds...
      </p>
      <button
        onClick={resetErrorBoundary}
        className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
      >
        <FiRefreshCw className="mr-2 h-4 w-4" />
        Reload Now
      </button>
    </div>
  );
}
