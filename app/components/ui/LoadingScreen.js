"use client";

import { FiLoader } from "react-icons/fi";

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
        <FiLoader className="animate-spin h-12 w-12 text-blue-500 mb-4" />
        <p className="text-gray-700 dark:text-gray-300 text-lg">{message}</p>
      </div>
    </div>
  );
}
