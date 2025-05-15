"use client";

import { useState, useEffect } from "react";
import { FiLoader } from "react-icons/fi";

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center z-50">
      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
        StockAnalytics
      </div>
      <div className="text-center mb-8">
        <FiLoader className="animate-spin h-10 w-10 text-blue-500 mb-2" />
        <p className="text-gray-600 dark:text-gray-400">
          Loading your dashboard...
        </p>
      </div>
      <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 animate-pulse"></div>
      </div>
    </div>
  );
}
