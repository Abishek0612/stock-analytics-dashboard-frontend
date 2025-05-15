"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/lib/config";
import {
  FiLoader,
  FiCheck,
  FiBell,
  FiMail,
  FiAlertCircle,
  FiBarChart2,
  FiFileText,
} from "react-icons/fi";

export default function NotificationSettings({ setError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: {
      dailyReport: false,
      weeklyReport: true,
      priceAlerts: true,
      newsAlerts: true,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/settings`);
        if (response.data.status === "success" && response.data.data.settings) {
          setSettings(response.data.data.settings);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
        setError("Failed to load notification settings");
      }
    };

    fetchSettings();
  }, [setError]);

  const handleToggle = (category, setting) => {
    setSettings((prevSettings) => {
      const newSettings = { ...prevSettings };
      newSettings[category][setting] = !prevSettings[category][setting];
      return newSettings;
    });
  };

  const saveSettings = async () => {
    setIsLoading(true);
    setSuccess(false);
    setError("");

    try {
      const response = await axios.patch(`${API_URL}/users/settings`, {
        settings,
      });

      if (response.data.status === "success") {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError(
        err.response?.data?.message || "Failed to save notification settings"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <FiMail className="mr-2 h-5 w-5 text-gray-500" />
            Email Notifications
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Manage the emails you want to receive. These emails are typically
            related to important account updates and stock market insights.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                  <FiFileText className="mr-2 h-4 w-4 text-gray-500" />
                  Daily Market Report
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Receive a daily summary of your portfolio performance and
                  market updates.
                </p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="dailyReport"
                  id="dailyReport"
                  checked={settings.emailNotifications.dailyReport}
                  onChange={() =>
                    handleToggle("emailNotifications", "dailyReport")
                  }
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="dailyReport"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.emailNotifications.dailyReport
                      ? "bg-blue-500"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                ></label>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                  <FiBarChart2 className="mr-2 h-4 w-4 text-gray-500" />
                  Weekly Market Report
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Receive a detailed weekly summary with market trends and
                  portfolio analytics.
                </p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="weeklyReport"
                  id="weeklyReport"
                  checked={settings.emailNotifications.weeklyReport}
                  onChange={() =>
                    handleToggle("emailNotifications", "weeklyReport")
                  }
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="weeklyReport"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.emailNotifications.weeklyReport
                      ? "bg-blue-500"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                ></label>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                  <FiAlertCircle className="mr-2 h-4 w-4 text-gray-500" />
                  Price Alerts
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Receive notifications when stocks in your watchlist reach
                  price thresholds.
                </p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="priceAlerts"
                  id="priceAlerts"
                  checked={settings.emailNotifications.priceAlerts}
                  onChange={() =>
                    handleToggle("emailNotifications", "priceAlerts")
                  }
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="priceAlerts"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.emailNotifications.priceAlerts
                      ? "bg-blue-500"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                ></label>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                  <FiBell className="mr-2 h-4 w-4 text-gray-500" />
                  News Alerts
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Receive breaking news and updates related to your watched
                  stocks.
                </p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="newsAlerts"
                  id="newsAlerts"
                  checked={settings.emailNotifications.newsAlerts}
                  onChange={() =>
                    handleToggle("emailNotifications", "newsAlerts")
                  }
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="newsAlerts"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.emailNotifications.newsAlerts
                      ? "bg-blue-500"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                ></label>
              </div>
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
              "Save Settings"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
