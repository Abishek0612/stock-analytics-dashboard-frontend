"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/lib/config";
import {
  FiLoader,
  FiCheck,
  FiPieChart,
  FiBarChart,
  FiActivity,
} from "react-icons/fi";

export default function ChartSettings({ setError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    chartPreferences: {
      defaultTimeframe: "1M",
      showVolume: true,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/settings`);
        if (response.data.status === "success" && response.data.data.settings) {
          const chartSettings = response.data.data.settings
            .chartPreferences || {
            defaultTimeframe: "1M",
            showVolume: true,
          };
          setSettings({
            chartPreferences: chartSettings,
          });
        }
      } catch (err) {
        console.error("Failed to fetch chart settings:", err);
        setError("Failed to load chart settings");
      }
    };

    fetchSettings();
  }, [setError]);

  const handleTimeframeChange = (e) => {
    setSettings({
      ...settings,
      chartPreferences: {
        ...settings.chartPreferences,
        defaultTimeframe: e.target.value,
      },
    });
  };

  const handleVolumeToggle = () => {
    setSettings({
      ...settings,
      chartPreferences: {
        ...settings.chartPreferences,
        showVolume: !settings.chartPreferences.showVolume,
      },
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
      console.error("Failed to save chart settings:", err);
      setError(err.response?.data?.message || "Failed to save chart settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Chart Preferences</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <FiPieChart className="mr-2 h-5 w-5 text-gray-500" />
            Default Chart Settings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Customize how charts are displayed by default in your dashboard.
          </p>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="defaultTimeframe"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Default Timeframe
              </label>
              <div className="relative rounded-md shadow-sm">
                <select
                  id="defaultTimeframe"
                  value={settings.chartPreferences.defaultTimeframe}
                  onChange={handleTimeframeChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="1D">1 Day</option>
                  <option value="1W">1 Week</option>
                  <option value="1M">1 Month</option>
                  <option value="3M">3 Months</option>
                  <option value="1Y">1 Year</option>
                  <option value="YTD">Year to Date</option>
                  <option value="MTD">Month to Date</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This will be the default view when you open the dashboard.
              </p>
            </div>

            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                  <FiBarChart className="mr-2 h-4 w-4 text-gray-500" />
                  Show Volume Indicators
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Display trading volume data beneath price charts.
                </p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="showVolume"
                  id="showVolume"
                  checked={settings.chartPreferences.showVolume}
                  onChange={handleVolumeToggle}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="showVolume"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.chartPreferences.showVolume
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
