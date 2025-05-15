"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import axios from "axios";
import { API_URL } from "@/lib/config";
import { FiSun, FiMoon, FiLoader, FiCheck, FiMonitor } from "react-icons/fi";

export default function AppearanceSettings({ setError }) {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (theme) {
      setSelectedTheme(theme);
    }
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
  };

  const saveSettings = async () => {
    setIsLoading(true);
    setSuccess(false);
    setError("");

    try {
      const response = await axios.patch(`${API_URL}/users/settings`, {
        settings: {
          theme: selectedTheme,
        },
      });

      if (response.data.status === "success") {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save appearance settings:", err);
      setError(
        err.response?.data?.message || "Failed to save appearance settings"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Appearance Settings</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Theme</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose how StockAnalytics looks to you. Select a light or dark
            theme, or sync with your system settings.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`relative p-4 rounded-lg border-2 ${
                selectedTheme === "light"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              } cursor-pointer`}
              onClick={() => handleThemeChange("light")}
            >
              <div className="flex items-center justify-center h-24 mb-4 bg-gray-100 rounded border border-gray-200">
                <FiSun className="h-12 w-12 text-yellow-500" />
              </div>
              <div className="text-center">
                <h4 className="font-medium">Light</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Light background with dark text
                </p>
              </div>
              {selectedTheme === "light" && (
                <div className="absolute top-2 right-2">
                  <FiCheck className="h-5 w-5 text-blue-500" />
                </div>
              )}
            </div>

            <div
              className={`relative p-4 rounded-lg border-2 ${
                selectedTheme === "dark"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              } cursor-pointer`}
              onClick={() => handleThemeChange("dark")}
            >
              <div className="flex items-center justify-center h-24 mb-4 bg-gray-800 rounded border border-gray-700">
                <FiMoon className="h-12 w-12 text-gray-100" />
              </div>
              <div className="text-center">
                <h4 className="font-medium">Dark</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Dark background with light text
                </p>
              </div>
              {selectedTheme === "dark" && (
                <div className="absolute top-2 right-2">
                  <FiCheck className="h-5 w-5 text-blue-500" />
                </div>
              )}
            </div>

            <div
              className={`relative p-4 rounded-lg border-2 ${
                selectedTheme === "system"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              } cursor-pointer`}
              onClick={() => handleThemeChange("system")}
            >
              <div className="flex items-center justify-center h-24 mb-4 bg-gradient-to-r from-gray-100 to-gray-800 rounded border border-gray-300">
                <FiMonitor className="h-12 w-12 text-gray-600" />
              </div>
              <div className="text-center">
                <h4 className="font-medium">System</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Sync with system theme settings
                </p>
              </div>
              {selectedTheme === "system" && (
                <div className="absolute top-2 right-2">
                  <FiCheck className="h-5 w-5 text-blue-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={saveSettings}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : success ? (
              <>
                <FiCheck className="-ml-1 mr-2 h-4 w-4" />
                Saved!
              </>
            ) : (
              "Save Preferences"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
